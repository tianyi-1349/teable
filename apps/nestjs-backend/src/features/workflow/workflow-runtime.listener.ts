import { Injectable, Logger } from '@nestjs/common';
import { FieldKeyType, HttpErrorCode } from '@teable/core';
import type { IWorkflowAction, IWorkflowCondition, IWorkflowExecutionStep } from '@teable/openapi';
import { workflowActionConfigSchemaMap } from '@teable/openapi';
import axios from 'axios';
import { OnEvent } from '@nestjs/event-emitter';
import { isEqual } from 'lodash';
import { Events, type IButtonClickEventPayload } from '../../event-emitter/events';
import { CustomHttpException } from '../../custom.exception';
import { getSsrfSafeAgents } from '../../utils/ssrf-guard';
import { AiService } from '../ai/ai.service';
import { RecordOpenApiService } from '../record/open-api/record-open-api.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowService } from './workflow.service';

@Injectable()
export class WorkflowRuntimeListener {
  private readonly logger = new Logger(WorkflowRuntimeListener.name);

  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowExecutionService: WorkflowExecutionService,
    private readonly recordOpenApiService: RecordOpenApiService,
    private readonly aiService: AiService
  ) {}

  private getObjectConfig(action: IWorkflowAction) {
    const config = action.config;
    return config && typeof config === 'object' && !Array.isArray(config)
      ? (config as Record<string, unknown>)
      : {};
  }

  private validateActionConfig(action: IWorkflowAction) {
    const schema = workflowActionConfigSchemaMap[action.type];
    if (!schema) {
      return;
    }

    const result = schema.safeParse(action.config);
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new Error(
        `Workflow action ${action.id ?? action.type} config validation failed: ${issues}`
      );
    }
  }

  private getRecordIdFromValue(value: unknown): string | undefined {
    if (typeof value === 'string' && value) {
      return value;
    }

    if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'string') {
      return value.id;
    }

    return undefined;
  }

  private getConditionValue(payload: IButtonClickEventPayload, field: string | undefined) {
    if (!field) {
      return undefined;
    }

    return payload.record.fields[field];
  }

  private stringifyAiSourceValue(value: unknown): string {
    if (value == null) {
      return '';
    }

    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => this.stringifyAiSourceValue(item))
        .filter(Boolean)
        .join('\n');
    }

    return JSON.stringify(value);
  }

  private buildLegacyAiSourceText(payload: IButtonClickEventPayload): string {
    return Object.entries(payload.record.fields)
      .map(([field, value]) => {
        const text = this.stringifyAiSourceValue(value);
        return text ? `${field}: ${text}` : `${field}:`;
      })
      .join('\n');
  }

  private resolveAiTargetRecordId(
    tableId: string,
    config: Record<string, unknown>,
    payload: IButtonClickEventPayload
  ) {
    let targetRecordId = typeof config.recordId === 'string' ? config.recordId : undefined;

    if (!targetRecordId && tableId === payload.tableId) {
      targetRecordId = payload.record.id;
    }

    if (!targetRecordId && typeof config.targetFieldId === 'string') {
      targetRecordId = this.getRecordIdFromValue(payload.record.fields[config.targetFieldId]);
    }

    return targetRecordId;
  }

  private getAiFieldIds(config: Record<string, unknown>) {
    if (Array.isArray(config.fieldIds)) {
      return config.fieldIds.filter((fieldId): fieldId is string => typeof fieldId === 'string');
    }

    if (typeof config.targetFieldId === 'string' && config.targetFieldId) {
      return [config.targetFieldId];
    }

    return [];
  }

  private resolveAiSourceText(config: Record<string, unknown>, payload: IButtonClickEventPayload) {
    if (typeof config.sourceText === 'string' && config.sourceText.trim()) {
      return config.sourceText.trim();
    }

    if (typeof config.sourceFieldId === 'string' && config.sourceFieldId) {
      return this.stringifyAiSourceValue(payload.record.fields[config.sourceFieldId]);
    }

    if (typeof config.prompt === 'string' && config.prompt.trim()) {
      return this.buildLegacyAiSourceText(payload);
    }

    return '';
  }

  private valuesEqual(left: unknown, right: unknown) {
    return isEqual(left, right);
  }

  private matchesCondition(condition: IWorkflowCondition, payload: IButtonClickEventPayload) {
    if (condition.enabled === false) {
      return true;
    }

    const operator = condition.operator ?? 'eq';
    const actualValue = this.getConditionValue(payload, condition.field);
    const expectedValue = condition.value;

    switch (operator) {
      case 'eq':
        return this.valuesEqual(actualValue, expectedValue);
      case 'ne':
        return !this.valuesEqual(actualValue, expectedValue);
      case 'contains':
        if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
          return actualValue.includes(expectedValue);
        }
        if (Array.isArray(actualValue)) {
          return actualValue.some((item) => this.valuesEqual(item, expectedValue));
        }
        return false;
      case 'notContains':
      case 'doesNotContain':
        if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
          return !actualValue.includes(expectedValue);
        }
        if (Array.isArray(actualValue)) {
          return !actualValue.some((item) => this.valuesEqual(item, expectedValue));
        }
        return true;
      case 'gt':
        return typeof actualValue === 'number' && typeof expectedValue === 'number'
          ? actualValue > expectedValue
          : false;
      case 'gte':
        return typeof actualValue === 'number' && typeof expectedValue === 'number'
          ? actualValue >= expectedValue
          : false;
      case 'lt':
        return typeof actualValue === 'number' && typeof expectedValue === 'number'
          ? actualValue < expectedValue
          : false;
      case 'lte':
        return typeof actualValue === 'number' && typeof expectedValue === 'number'
          ? actualValue <= expectedValue
          : false;
      case 'in':
        return Array.isArray(expectedValue)
          ? expectedValue.some((item) => this.valuesEqual(actualValue, item))
          : false;
      case 'notIn':
        return Array.isArray(expectedValue)
          ? !expectedValue.some((item) => this.valuesEqual(actualValue, item))
          : false;
      case 'isEmpty':
        return (
          actualValue == null ||
          actualValue === '' ||
          (Array.isArray(actualValue) && actualValue.length === 0)
        );
      case 'notEmpty':
      case 'isNotEmpty':
        return !(
          actualValue == null ||
          actualValue === '' ||
          (Array.isArray(actualValue) && actualValue.length === 0)
        );
      default:
        throw new Error(`Unsupported workflow condition operator: ${operator}`);
    }
  }

  private shouldRunWorkflow(
    conditions: IWorkflowCondition[] | undefined,
    payload: IButtonClickEventPayload
  ) {
    return (conditions ?? []).every((condition) => this.matchesCondition(condition, payload));
  }

  private createRunningStep(action: IWorkflowAction, index: number): IWorkflowExecutionStep {
    return {
      id: action.id ?? `${action.type}-${index + 1}`,
      index,
      actionId: action.id,
      actionType: action.type,
      actionName: action.name,
      status: 'running',
      startedTime: new Date().toISOString(),
      completedTime: null,
      errorMessage: null,
    };
  }

  private finishStep(
    step: IWorkflowExecutionStep,
    status: IWorkflowExecutionStep['status'],
    errorMessage?: string
  ): IWorkflowExecutionStep {
    return {
      ...step,
      status,
      completedTime: new Date().toISOString(),
      errorMessage: errorMessage ?? null,
    };
  }

  private snapshotSteps(steps: IWorkflowExecutionStep[]) {
    return steps.map((step) => ({ ...step }));
  }

  private async executeAction(
    action: IWorkflowAction,
    payload: IButtonClickEventPayload,
    baseId: string
  ) {
    this.validateActionConfig(action);
    const config = this.getObjectConfig(action);

    if (action.type === 'ai') {
      const tableId =
        typeof config.tableId === 'string' && config.tableId ? config.tableId : payload.tableId;
      const fieldIds = this.getAiFieldIds(config);
      const sourceText = this.resolveAiSourceText(config, payload);
      const instructions =
        typeof config.instructions === 'string' && config.instructions.trim()
          ? config.instructions.trim()
          : typeof config.prompt === 'string' && config.prompt.trim()
            ? config.prompt.trim()
            : undefined;

      if (!fieldIds.length) {
        throw new Error(
          `Workflow action ${action.id ?? action.type} requires fieldIds or targetFieldId`
        );
      }

      if (!sourceText) {
        throw new Error(
          `Workflow action ${action.id ?? action.type} requires sourceText, sourceFieldId, or legacy prompt context`
        );
      }

      const recordId = this.resolveAiTargetRecordId(tableId, config, payload);
      const preview = await this.aiService.previewExtractAndWrite(baseId, {
        tableId,
        recordId,
        sourceText,
        instructions,
        fieldIds,
        modelKey: typeof config.modelKey === 'string' ? config.modelKey : undefined,
      });

      await this.aiService.applyExtractAndWrite(baseId, {
        tableId,
        recordId,
        fields: preview.fields,
      });
      return;
    }

    if (action.type === 'createRecord') {
      const tableId = typeof config.tableId === 'string' ? config.tableId : '';
      const fields = config.fields;

      if (!tableId || !fields || typeof fields !== 'object' || Array.isArray(fields)) {
        throw new Error(
          `Workflow action ${action.id ?? action.type} is missing createRecord config`
        );
      }

      const recordFields = fields as Record<string, unknown>;

      await this.recordOpenApiService.multipleCreateRecords(
        tableId,
        {
          fieldKeyType: FieldKeyType.Id,
          records: [{ fields: recordFields }],
        },
        false,
        'true'
      );
      return;
    }

    if (action.type === 'updateRecord') {
      const tableId = typeof config.tableId === 'string' ? config.tableId : '';
      const fields = config.fields;

      if (!tableId || !fields || typeof fields !== 'object' || Array.isArray(fields)) {
        throw new Error(
          `Workflow action ${action.id ?? action.type} is missing updateRecord config`
        );
      }

      const recordFields = fields as Record<string, unknown>;

      let targetRecordId = typeof config.recordId === 'string' ? config.recordId : undefined;

      if (!targetRecordId && tableId === payload.tableId) {
        targetRecordId = payload.record.id;
      }

      if (!targetRecordId && typeof config.targetFieldId === 'string') {
        targetRecordId = this.getRecordIdFromValue(payload.record.fields[config.targetFieldId]);
      }

      if (!targetRecordId) {
        throw new Error(
          `Workflow action ${action.id ?? action.type} requires recordId or same-table target to update`
        );
      }

      await this.recordOpenApiService.updateRecord(
        tableId,
        targetRecordId,
        {
          fieldKeyType: FieldKeyType.Id,
          record: { fields: recordFields },
        },
        undefined,
        'true'
      );
      return;
    }

    if (action.type === 'httpRequest') {
      const rawUrl = typeof config.url === 'string' ? config.url : '';
      const method = typeof config.method === 'string' ? config.method.toUpperCase() : 'POST';
      const headers =
        config.headers && typeof config.headers === 'object' && !Array.isArray(config.headers)
          ? (config.headers as Record<string, string>)
          : undefined;

      if (!rawUrl) {
        throw new Error(`Workflow action ${action.id ?? action.type} is missing request URL`);
      }

      const url = new URL(rawUrl);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error(
          `Workflow action ${action.id ?? action.type} only supports HTTP or HTTPS URLs`
        );
      }

      await axios.request({
        url: url.toString(),
        method,
        data: config.body,
        headers,
        timeout: 10000,
        ...getSsrfSafeAgents(),
      });
    }
  }

  private async executeActions(
    executionId: string,
    actions: IWorkflowAction[] | undefined,
    payload: IButtonClickEventPayload,
    baseId: string
  ) {
    const steps: IWorkflowExecutionStep[] = [];

    for (const [index, action] of (actions ?? []).entries()) {
      const runningStep = this.createRunningStep(action, index);
      steps.push(runningStep);
      await this.workflowExecutionService.updateExecutionSteps(
        executionId,
        this.snapshotSteps(steps)
      );

      try {
        await this.executeAction(action, payload, baseId);
        steps[index] = this.finishStep(runningStep, 'succeeded');
        await this.workflowExecutionService.updateExecutionSteps(
          executionId,
          this.snapshotSteps(steps)
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown workflow runtime error';
        steps[index] = this.finishStep(runningStep, 'failed', message);
        await this.workflowExecutionService.updateExecutionSteps(
          executionId,
          this.snapshotSteps(steps)
        );
        throw error;
      }
    }

    return steps;
  }

  @OnEvent(Events.TABLE_BUTTON_CLICK, { async: true })
  async handleButtonClick(payload: IButtonClickEventPayload) {
    const tableMeta = await this.workflowService.getTableBaseId(payload.tableId);
    const workflow = await this.workflowService.getWorkflowRuntimeById(
      payload.workflowId,
      tableMeta?.baseId
    );

    if (!workflow || !workflow.isActive) {
      return;
    }

    const execution = await this.workflowExecutionService.createExecution({
      workflowId: workflow.id,
      baseId: workflow.baseId,
      triggerType: workflow.trigger?.type,
      actionCount: workflow.actions?.length ?? 0,
      eventPayload: {
        tableId: payload.tableId,
        fieldId: payload.fieldId,
        recordId: payload.record.id,
      },
    });

    try {
      if (!this.shouldRunWorkflow(workflow.conditions, payload)) {
        await this.workflowExecutionService.markExecutionSucceeded(execution.id);
        return;
      }

      await this.executeActions(execution.id, workflow.actions, payload, workflow.baseId);
      await this.workflowExecutionService.markExecutionSucceeded(execution.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown workflow runtime error';
      this.logger.error(
        `Workflow execution failed: ${workflow.id}`,
        error instanceof Error ? error.stack : undefined
      );
      await this.workflowExecutionService.markExecutionFailed(execution.id, message);
    }
  }
}
