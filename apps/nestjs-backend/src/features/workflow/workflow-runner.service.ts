import { Injectable } from '@nestjs/common';
import type { IFilterSet } from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import axios from 'axios';
import { ClsService } from 'nestjs-cls';
import type { IClsStore } from '../../types/cls';
import { getSsrfSafeAgents } from '../../utils/ssrf-guard';
import { AuthorityPolicyService } from '../authority-matrix/authority-policy.service';
import { MailSenderService } from '../mail-sender/mail-sender.service';
import { RecordOpenApiService } from '../record/open-api/record-open-api.service';
import { RecordService } from '../record/record.service';
import { ScriptRuntimeService } from './script/script-runtime.service';
import { WorkflowAiService } from './workflow-ai.service';
import {
  buildWorkflowRunFailureData,
  buildWorkflowRunStartData,
  buildWorkflowRunStepFailureData,
  buildWorkflowRunStepStartData,
  buildWorkflowRunStepSuccessData,
  buildWorkflowRunSuccessData,
} from './workflow-run-state';

interface IWorkflowSnapshotNode {
  id: string;
  nodeType: string;
  kind: string;
  parentNodeId?: string | null;
  nextNodeId?: string | null;
  config?: unknown;
}

interface IWorkflowSnapshot {
  baseId: string;
  nodes?: IWorkflowSnapshotNode[];
}

function getScript(config: unknown): string | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { script, code } = config as { script?: unknown; code?: unknown };
  return typeof script === 'string' ? script : typeof code === 'string' ? code : undefined;
}

function getAiGenerateConfig(config: unknown): { prompt: string; modelKey?: string } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { prompt, modelKey } = config as { prompt?: unknown; modelKey?: unknown };
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return undefined;
  }
  return {
    prompt,
    ...(typeof modelKey === 'string' && modelKey.trim() && { modelKey }),
  };
}

function getUpdateRecordsConfig(
  config: unknown
): { tableId: string; recordId: string; fields: Record<string, unknown> } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { tableId, recordId, fields } = config as {
    tableId?: unknown;
    recordId?: unknown;
    fields?: unknown;
  };
  if (
    typeof tableId !== 'string' ||
    !tableId.trim() ||
    typeof recordId !== 'string' ||
    !recordId.trim() ||
    !fields ||
    typeof fields !== 'object' ||
    Array.isArray(fields)
  ) {
    return undefined;
  }
  return { tableId, recordId, fields: fields as Record<string, unknown> };
}

function getCreateRecordsConfig(
  config: unknown
): { tableId: string; records: Record<string, unknown>[] } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { tableId, records } = config as { tableId?: unknown; records?: unknown };
  if (
    typeof tableId !== 'string' ||
    !tableId.trim() ||
    !Array.isArray(records) ||
    !records.length ||
    records.some((record) => !record || typeof record !== 'object' || Array.isArray(record))
  ) {
    return undefined;
  }
  return { tableId, records: records as Record<string, unknown>[] };
}

function getQueryRecordsConfig(
  config: unknown
): { tableId: string; filter?: IFilterSet; take?: number } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { tableId, filter, take } = config as {
    tableId?: unknown;
    filter?: unknown;
    take?: unknown;
  };
  if (
    typeof tableId !== 'string' ||
    !tableId.trim() ||
    (filter != null && (typeof filter !== 'object' || Array.isArray(filter))) ||
    (take != null && (typeof take !== 'number' || !Number.isInteger(take) || take <= 0))
  ) {
    return undefined;
  }
  return {
    tableId,
    ...(filter && { filter: filter as IFilterSet }),
    ...(take != null && { take }),
  };
}

function getSendEmailConfig(
  config: unknown
): { to: string[]; subject: string; text?: string; html?: string } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { to, subject, text, html } = config as {
    to?: unknown;
    subject?: unknown;
    text?: unknown;
    html?: unknown;
  };
  if (
    !Array.isArray(to) ||
    !to.length ||
    to.some((item) => typeof item !== 'string' || !item.trim()) ||
    typeof subject !== 'string' ||
    !subject.trim() ||
    (text != null && typeof text !== 'string') ||
    (html != null && typeof html !== 'string')
  ) {
    return undefined;
  }
  return {
    to: to as string[],
    subject,
    ...(typeof text === 'string' && text.trim() && { text }),
    ...(typeof html === 'string' && html.trim() && { html }),
  };
}

function getHttpRequestConfig(config: unknown):
  | {
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      url: string;
      headers?: Record<string, string>;
      body?: unknown;
      timeoutMs?: number;
    }
  | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { method, url, headers, body, timeoutMs } = config as {
    method?: unknown;
    url?: unknown;
    headers?: unknown;
    body?: unknown;
    timeoutMs?: unknown;
  };
  if (
    typeof url !== 'string' ||
    !url.trim() ||
    (method != null && !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(String(method))) ||
    (headers != null &&
      (typeof headers !== 'object' ||
        Array.isArray(headers) ||
        Object.values(headers as Record<string, unknown>).some(
          (value) => typeof value !== 'string'
        ))) ||
    (timeoutMs != null &&
      (typeof timeoutMs !== 'number' || !Number.isFinite(timeoutMs) || timeoutMs <= 0))
  ) {
    return undefined;
  }
  return {
    method: (typeof method === 'string' ? method : 'POST') as
      | 'GET'
      | 'POST'
      | 'PUT'
      | 'PATCH'
      | 'DELETE',
    url,
    ...(headers && { headers: headers as Record<string, string> }),
    ...(body !== undefined && { body }),
    ...(timeoutMs != null && { timeoutMs }),
  };
}

function getConditionConfig(config: unknown): { expression: string; output?: unknown } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { expression, output } = config as { expression?: unknown; output?: unknown };
  if (typeof expression !== 'string' || !expression.trim()) {
    return undefined;
  }
  return { expression, ...(output !== undefined && { output }) };
}

function getLoopConfig(config: unknown): { itemsPath: string; maxIterations?: number } | undefined {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  const { itemsPath, maxIterations } = config as { itemsPath?: unknown; maxIterations?: unknown };
  if (
    typeof itemsPath !== 'string' ||
    !itemsPath.trim() ||
    (maxIterations != null &&
      (typeof maxIterations !== 'number' || !Number.isInteger(maxIterations) || maxIterations <= 0))
  ) {
    return undefined;
  }
  return { itemsPath, ...(maxIterations != null && { maxIterations }) };
}

const supportedActionKinds = [
  'runScript',
  'aiGenerate',
  'updateRecords',
  'createRecords',
  'queryRecords',
  'sendEmail',
  'httpRequest',
  'condition',
  'loop',
];

function interpolateValue(value: unknown, input: unknown): unknown {
  if (typeof value === 'string') {
    return interpolateTemplate(value, input);
  }

  if (Array.isArray(value)) {
    return value.map((item) => interpolateValue(item, input));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, interpolateValue(item, input)])
    );
  }

  return value;
}

function getInputPathValue(input: unknown, path: string) {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[segment.replace(/\?$/, '')];
  }, input);
}

function interpolateTemplate(template: string, input: unknown) {
  return template.replace(/\{\{\s*input(?:\.([\w?.]+))?\s*\}\}/g, (_match, path?: string) => {
    const value = path ? getInputPathValue(input, path) : input;
    if (value == null) {
      return '';
    }
    return typeof value === 'string' ? value : JSON.stringify(value);
  });
}

function sortActionsByChain(actions: IWorkflowSnapshotNode[]) {
  const actionMap = new Map(actions.map((action) => [action.id, action]));
  const firstAction = actions.find(
    (action) => !action.parentNodeId || !actionMap.has(action.parentNodeId)
  );
  if (!firstAction) {
    return actions;
  }

  const sorted: IWorkflowSnapshotNode[] = [];
  const visited = new Set<string>();
  let current: IWorkflowSnapshotNode | undefined = firstAction;

  while (current && !visited.has(current.id)) {
    sorted.push(current);
    visited.add(current.id);
    current = current.nextNodeId ? actionMap.get(current.nextNodeId) : undefined;
  }

  const remaining = actions.filter((action) => !visited.has(action.id));
  return [...sorted, ...remaining];
}

@Injectable()
export class WorkflowRunnerService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly scriptRuntimeService: ScriptRuntimeService,
    private readonly workflowAiService: WorkflowAiService,
    private readonly mailSenderService: MailSenderService,
    private readonly recordsService: RecordOpenApiService,
    private readonly recordService: RecordService,
    private readonly authorityPolicyService: AuthorityPolicyService,
    private readonly cls: ClsService<IClsStore>
  ) {}

  async executeWorkflowRun(runId: string): Promise<void> {
    const run = await this.prismaService.workflowRun.findUniqueOrThrow({
      where: { id: runId },
      select: {
        id: true,
        input: true,
        workflow: { select: { id: true, baseId: true } },
        snapshot: { select: { snapshot: true } },
      },
    });
    const startedTime = new Date();
    const snapshot = (run.snapshot?.snapshot ?? {}) as Partial<IWorkflowSnapshot>;
    const baseId = snapshot.baseId ?? run.workflow.baseId;
    const actions = sortActionsByChain(
      (snapshot.nodes ?? []).filter((node) => node.nodeType === 'action')
    );

    // Set automation context to prevent recursive triggers
    const automationContext: IClsStore['automationContext'] = {
      source: 'automation',
      workflowId: run.workflow.id,
      runId: run.id,
      baseId,
      timestamp: new Date().toISOString(),
    };

    await this.cls.set('automationContext', automationContext);

    await this.prismaService.workflowRun.update({
      where: { id: runId },
      data: buildWorkflowRunStartData(startedTime),
    });

    if (!actions.length) {
      await this.prismaService.workflowRun.update({
        where: { id: runId },
        data: buildWorkflowRunSuccessData(startedTime, startedTime, {
          skipped: true,
          reason: 'No workflow runner actions are configured yet',
        }),
      });
      return;
    }

    let currentInput: unknown = run.input;

    try {
      for (const action of actions) {
        currentInput = await this.executeAction(runId, baseId, action, currentInput);
      }

      const finishedTime = new Date();
      await this.prismaService.workflowRun.update({
        where: { id: runId },
        data: buildWorkflowRunSuccessData(startedTime, finishedTime, currentInput),
      });
      await this.syncNodeTestState(runId, 'completed', currentInput);
    } catch (error) {
      const finishedTime = new Date();
      const message = error instanceof Error ? error.message : String(error);
      await this.prismaService.workflowRun.update({
        where: { id: runId },
        data: buildWorkflowRunFailureData(startedTime, finishedTime, message),
      });
      await this.syncNodeTestState(runId, 'failed', { message });
    }
  }

  private async syncNodeTestState(runId: string, status: string, output: unknown) {
    const run = await this.prismaService.workflowRun.findUnique({
      where: { id: runId },
      select: {
        triggerType: true,
        snapshot: { select: { snapshot: true } },
      },
    });
    if (run?.triggerType !== 'manualNodeTest') {
      return;
    }

    const snapshot = (run.snapshot?.snapshot ?? {}) as Partial<IWorkflowSnapshot>;
    const actionNodes = (snapshot.nodes ?? []).filter((node) => node.nodeType === 'action');
    const targetNode = actionNodes[actionNodes.length - 1];
    if (!targetNode) {
      return;
    }

    await this.prismaService.workflowNode.update({
      where: { id: targetNode.id },
      data: {
        testStatus: status,
        testOutput: output as never,
      },
    });
  }

  private async executeAction(
    runId: string,
    baseId: string,
    action: IWorkflowSnapshotNode,
    input: unknown
  ): Promise<unknown> {
    const step = await this.prismaService.workflowRunStep.create({
      data: buildWorkflowRunStepStartData(runId, action.id, input),
      select: { id: true, startedTime: true },
    });

    const invalidMessage = this.getInvalidActionMessage(action);
    if (invalidMessage) {
      await this.prismaService.workflowRunStep.update({
        where: { id: step.id },
        data: buildWorkflowRunStepFailureData(step.startedTime, new Date(), invalidMessage),
      });
      throw new Error(invalidMessage);
    }

    try {
      const output = await this.executeConfiguredAction(baseId, action, input);
      const finishedTime = new Date();
      await this.prismaService.workflowRunStep.update({
        where: { id: step.id },
        data: buildWorkflowRunStepSuccessData(step.startedTime, finishedTime, output),
      });
      return output;
    } catch (error) {
      const finishedTime = new Date();
      const message = error instanceof Error ? error.message : String(error);
      await this.prismaService.workflowRunStep.update({
        where: { id: step.id },
        data: buildWorkflowRunStepFailureData(step.startedTime, finishedTime, message),
      });
      throw error;
    }
  }

  private getInvalidActionMessage(action: IWorkflowSnapshotNode) {
    if (action.kind === 'runScript' && !getScript(action.config)) {
      return `Run Script node ${action.id} is missing script content`;
    }
    if (action.kind === 'aiGenerate' && !getAiGenerateConfig(action.config)) {
      return `AI Generate node ${action.id} is missing prompt`;
    }
    if (action.kind === 'updateRecords' && !getUpdateRecordsConfig(action.config)) {
      return `Update Records node ${action.id} is missing tableId, recordId, or fields`;
    }
    if (action.kind === 'createRecords' && !getCreateRecordsConfig(action.config)) {
      return `Create Records node ${action.id} is missing tableId or records`;
    }
    if (action.kind === 'queryRecords' && !getQueryRecordsConfig(action.config)) {
      return `Query Records node ${action.id} is missing tableId or has invalid query options`;
    }
    if (action.kind === 'sendEmail' && !getSendEmailConfig(action.config)) {
      return `Send Email node ${action.id} is missing recipients or subject`;
    }
    if (action.kind === 'httpRequest' && !getHttpRequestConfig(action.config)) {
      return `HTTP Request node ${action.id} is missing method or url`;
    }
    if (action.kind === 'condition' && !getConditionConfig(action.config)) {
      return `Condition node ${action.id} is missing expression`;
    }
    if (action.kind === 'loop' && !getLoopConfig(action.config)) {
      return `Loop node ${action.id} is missing itemsPath`;
    }
    if (!supportedActionKinds.includes(action.kind)) {
      return `Unsupported workflow action ${action.kind}`;
    }
    return undefined;
  }

  private async executeConfiguredAction(
    baseId: string,
    action: IWorkflowSnapshotNode,
    input: unknown
  ) {
    if (action.kind === 'runScript') {
      await this.authorityPolicyService.assertWorkflowExecute(baseId);
      return this.scriptRuntimeService.execute(getScript(action.config)!, { baseId, input });
    }

    if (action.kind === 'aiGenerate') {
      await this.authorityPolicyService.assertWorkflowExecute(baseId);
      const text = await this.workflowAiService.generateText(baseId, {
        prompt: this.interpolatePrompt(getAiGenerateConfig(action.config)!.prompt, input),
        ...(getAiGenerateConfig(action.config)!.modelKey && {
          modelKey: getAiGenerateConfig(action.config)!.modelKey,
        }),
      });
      return { text };
    }

    // Handle record actions
    if (action.kind === 'updateRecords') {
      const config = interpolateValue(getUpdateRecordsConfig(action.config)!, input) as ReturnType<
        typeof getUpdateRecordsConfig
      >;
      if (!config?.tableId || !config.recordId) {
        throw new Error(`Update Records node ${action.id} resolved empty tableId or recordId`);
      }
      await this.authorityPolicyService.assertRecordUpdate(config.tableId);
      return this.recordsService.updateRecord(
        config.tableId,
        config.recordId,
        {
          record: { fields: config.fields },
        },
        undefined,
        'true'
      );
    }

    if (action.kind === 'createRecords') {
      const config = interpolateValue(getCreateRecordsConfig(action.config)!, input) as ReturnType<
        typeof getCreateRecordsConfig
      >;
      if (!config?.tableId) {
        throw new Error(`Create Records node ${action.id} resolved empty tableId`);
      }
      await this.authorityPolicyService.assertRecordCreate(config.tableId);
      return this.recordsService.multipleCreateRecords(
        config.tableId,
        { records: config.records.map((fields) => ({ fields })) },
        false,
        'true'
      );
    }

    if (action.kind === 'queryRecords') {
      const config = interpolateValue(getQueryRecordsConfig(action.config)!, input) as ReturnType<
        typeof getQueryRecordsConfig
      >;
      if (!config?.tableId) {
        throw new Error(`Query Records node ${action.id} resolved empty tableId`);
      }
      await this.authorityPolicyService.assertRecordRead(config.tableId);
      return this.recordService.getRecords(config.tableId, {
        filter: config.filter,
        take: config.take,
      });
    }

    if (action.kind === 'sendEmail') {
      await this.authorityPolicyService.assertWorkflowExecute(baseId);
      const config = interpolateValue(getSendEmailConfig(action.config)!, input) as ReturnType<
        typeof getSendEmailConfig
      >;
      await this.mailSenderService.sendMail({
        to: config!.to,
        subject: config!.subject,
        ...(config?.text && { text: config.text }),
        ...(config?.html && { html: config.html }),
      });
      return { delivered: true, recipients: config!.to };
    }

    if (action.kind === 'httpRequest') {
      await this.authorityPolicyService.assertWorkflowExecute(baseId);
      const config = interpolateValue(getHttpRequestConfig(action.config)!, input) as ReturnType<
        typeof getHttpRequestConfig
      >;
      const response = await axios.request({
        method: config!.method,
        url: config!.url,
        ...(config?.headers && { headers: config.headers }),
        ...(config?.body !== undefined && { data: config.body }),
        timeout: config?.timeoutMs ?? 10000,
        ...getSsrfSafeAgents(),
      });
      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    }

    if (action.kind === 'condition') {
      const config = interpolateValue(getConditionConfig(action.config)!, input) as ReturnType<
        typeof getConditionConfig
      >;
      const expression = config!.expression.trim().toLowerCase();
      const matched = ['true', '1', 'yes', 'match', JSON.stringify(input).toLowerCase()].some(
        (candidate) => candidate === expression || candidate.includes(expression)
      );
      return matched
        ? { matched: true, output: config?.output ?? input }
        : { matched: false, output: input };
    }

    if (action.kind === 'loop') {
      const config = getLoopConfig(action.config)!;
      const interpolatedItemsPath = String(config!.itemsPath || '').trim();
      const templateMatch = interpolatedItemsPath.match(/^\{\{\s*input(?:\.([\w?.]+))?\s*\}\}$/);
      const items = templateMatch
        ? templateMatch[1]
          ? getInputPathValue(input, templateMatch[1])
          : input
        : undefined;
      if (!Array.isArray(items)) {
        return { count: 0, items: [] };
      }
      const maxIterations = config?.maxIterations ?? 20;
      const sliced = items.slice(0, maxIterations);
      return {
        count: sliced.length,
        items: sliced,
        truncated: items.length > sliced.length,
      };
    }

    throw new Error(`Unsupported action type: ${action.kind}`);
  }

  private interpolatePrompt(prompt: string, input: unknown) {
    return interpolateTemplate(prompt, input);
  }
}
