import { createHmac } from 'crypto';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  generateWorkflowActionId,
  generateWorkflowId,
  generateWorkflowTriggerId,
  getUniqName,
  HttpErrorCode,
  type IFilter,
} from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import type {
  IAiCreateWorkflowDraftRo,
  IDuplicateWorkflowRo,
  IUpdateWorkflowRo,
  IWorkflowDetailVo,
  IWorkflowRo,
  IWorkflowRunDetailVo,
  IWorkflowRunVo,
  IWorkflowVo,
} from '@teable/openapi';
import { ClsService } from 'nestjs-cls';
import { CacheService } from '../../cache/cache.service';
import type { ICacheStore } from '../../cache/types';
import { type IThresholdConfig, ThresholdConfig } from '../../configs/threshold.config';
import { CustomHttpException } from '../../custom.exception';
import type { IClsStore } from '../../types/cls';
import { RecordService } from '../record/record.service';
import { getWorkflowActionCapability } from './actions/action-capability';
import { WorkflowAiService } from './workflow-ai.service';
import { buildWorkflowRunSuccessData } from './workflow-run-state';
import type { IWorkflowScheduleFacade } from './workflow-schedule.facade';
import { WorkflowScheduleService } from './workflow-schedule.service';

type IRecordTriggerType = 'recordCreated' | 'recordUpdated' | 'recordMatchesConditions';
type IDirectTriggerType =
  | 'buttonClick'
  | 'webhook'
  | 'schedule'
  | 'formSubmitted'
  | 'emailReceived';

type IRecordTriggerConfig = {
  tableId?: string;
  filter?: IFilter;
};

type IWebhookTriggerConfig = {
  secret?: string;
  signatureSecret?: string;
  signatureHeader?: string;
  timestampHeader?: string;
  bodySizeLimitKb?: number;
  timestampToleranceSeconds?: number;
};

type IScheduleTriggerConfig = {
  mode?: 'manual' | 'interval' | 'cron';
  intervalSeconds?: number;
  cron?: string;
};

type IWorkflowActionConfig = {
  script?: string;
  code?: string;
  prompt?: string;
  modelKey?: string;
};

type IWorkflowTestPlan = {
  input?: Record<string, unknown>;
  expectedActionKinds?: IAiDraftActionKind[];
  activationChecks?: string[];
};

type IAiDraftActionKind =
  | 'runScript'
  | 'aiGenerate'
  | 'updateRecords'
  | 'createRecords'
  | 'queryRecords'
  | 'sendEmail'
  | 'httpRequest'
  | 'condition'
  | 'loop';

type IGeneratedWorkflowDraftAction = {
  kind: IAiDraftActionKind;
  config: Record<string, unknown>;
};

type IAiDraftTriggerType =
  | 'buttonClick'
  | 'recordCreated'
  | 'recordUpdated'
  | 'recordMatchesConditions'
  | 'schedule'
  | 'webhook'
  | 'formSubmitted'
  | 'emailReceived';

type IGeneratedWorkflowDraft = {
  name: string;
  description: string;
  triggerType: IAiDraftTriggerType;
  triggerConfig?: Record<string, unknown>;
  actionKind: IAiDraftActionKind;
  actionConfig: Record<string, unknown>;
  actions?: IGeneratedWorkflowDraftAction[];
  fieldMappings?: Record<string, string>;
  testPlan?: IWorkflowTestPlan;
};

const workflowNotFoundLocalization = {
  i18nKey: 'httpErrors.baseNode.notFound',
} as const;
const workflowNotFoundMessage = 'Workflow not found';

@Injectable()
export class WorkflowService implements IWorkflowScheduleFacade {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly cls: ClsService<IClsStore>,
    private readonly workflowAiService: WorkflowAiService,
    private readonly recordService: RecordService,
    private readonly cacheService: CacheService<ICacheStore>,
    @ThresholdConfig() private readonly thresholdConfig: IThresholdConfig,
    @Inject(forwardRef(() => WorkflowScheduleService))
    private readonly workflowScheduleService: WorkflowScheduleService
  ) {}

  private get userId() {
    return this.cls.get('user.id');
  }

  private selectWorkflow() {
    return {
      id: true,
      baseId: true,
      name: true,
      description: true,
      order: true,
      isActive: true,
      activeSnapshotId: true,
      createdBy: true,
      createdTime: true,
      lastModifiedTime: true,
      lastModifiedBy: true,
    };
  }

  private selectWorkflowNode() {
    return {
      id: true,
      workflowId: true,
      nodeType: true,
      kind: true,
      parentNodeId: true,
      nextNodeId: true,
      branchKey: true,
      config: true,
      testStatus: true,
      testOutput: true,
    };
  }

  private selectWorkflowRun() {
    return {
      id: true,
      workflowId: true,
      snapshotId: true,
      triggerType: true,
      status: true,
      input: true,
      output: true,
      error: true,
      startedTime: true,
      finishedTime: true,
      durationMs: true,
      createdBy: true,
    };
  }

  private selectWorkflowRunStep() {
    return {
      id: true,
      runId: true,
      nodeId: true,
      status: true,
      input: true,
      output: true,
      error: true,
      startedTime: true,
      finishedTime: true,
      durationMs: true,
    };
  }

  async getWorkflowList(baseId: string): Promise<IWorkflowVo[]> {
    return this.prismaService.workflow.findMany({
      where: { baseId, deletedTime: null },
      select: this.selectWorkflow(),
      orderBy: { order: 'asc' },
    });
  }

  async getWorkflow(baseId: string, workflowId: string): Promise<IWorkflowDetailVo> {
    const workflow = await this.prismaService.workflow
      .findFirstOrThrow({
        where: { id: workflowId, baseId, deletedTime: null },
        select: {
          ...this.selectWorkflow(),
          nodes: {
            select: this.selectWorkflowNode(),
            orderBy: { createdTime: 'asc' },
          },
        },
      })
      .catch(() => {
        throw new CustomHttpException(workflowNotFoundMessage, HttpErrorCode.NOT_FOUND, {
          localization: workflowNotFoundLocalization,
        });
      });

    return {
      ...workflow,
      nodes: workflow.nodes.map((node) => ({
        ...node,
        nodeType: node.nodeType as 'trigger' | 'action' | 'logic',
      })),
    };
  }

  async getWorkflowRunList(baseId: string, workflowId: string): Promise<IWorkflowRunVo[]> {
    await this.getWorkflow(baseId, workflowId);
    return this.prismaService.workflowRun.findMany({
      where: { workflowId },
      select: this.selectWorkflowRun(),
      orderBy: { startedTime: 'desc' },
      take: 100,
    });
  }

  async getWorkflowRun(
    baseId: string,
    workflowId: string,
    runId: string
  ): Promise<IWorkflowRunDetailVo> {
    await this.getWorkflow(baseId, workflowId);
    return this.prismaService.workflowRun
      .findFirstOrThrow({
        where: { id: runId, workflowId },
        select: {
          ...this.selectWorkflowRun(),
          steps: {
            select: this.selectWorkflowRunStep(),
            orderBy: { startedTime: 'asc' },
          },
        },
      })
      .catch(() => {
        throw new CustomHttpException('Workflow run not found', HttpErrorCode.NOT_FOUND, {
          localization: workflowNotFoundLocalization,
        });
      });
  }

  async createWorkflow(baseId: string, ro: IWorkflowRo): Promise<IWorkflowVo> {
    const maxOrder = await this.prismaService.workflow.aggregate({
      where: { baseId, deletedTime: null },
      _max: { order: true },
    });

    return this.prismaService.$tx(async (prisma) => {
      const workflow = await prisma.workflow.create({
        data: {
          id: generateWorkflowId(),
          baseId,
          name: ro.name,
          description: ro.description,
          order: (maxOrder._max.order ?? 0) + 1,
          createdBy: this.userId,
          lastModifiedBy: this.userId,
        },
        select: this.selectWorkflow(),
      });

      const actionIds = ro.actions?.map(() => generateWorkflowActionId()) ?? [];
      const triggerId = ro.trigger ? generateWorkflowTriggerId() : undefined;

      if (ro.trigger && triggerId) {
        await prisma.workflowNode.create({
          data: {
            id: triggerId,
            workflowId: workflow.id,
            nodeType: 'trigger',
            kind: ro.trigger.type,
            nextNodeId: actionIds[0],
            config: ro.trigger.config as Prisma.InputJsonValue,
            createdBy: this.userId,
            lastModifiedBy: this.userId,
          },
        });
      }

      if (ro.actions?.length) {
        await prisma.workflowNode.createMany({
          data: ro.actions.map((action, index) => ({
            id: actionIds[index],
            workflowId: workflow.id,
            nodeType: 'action',
            kind: action.type,
            parentNodeId: index === 0 ? triggerId : actionIds[index - 1],
            nextNodeId: actionIds[index + 1],
            config: action.config as Prisma.InputJsonValue,
            createdBy: this.userId,
            lastModifiedBy: this.userId,
          })),
        });
      }

      return workflow;
    });
  }

  async aiCreateWorkflowDraft(
    baseId: string,
    ro: IAiCreateWorkflowDraftRo
  ): Promise<IWorkflowDetailVo> {
    const draft = await this.generateWorkflowDraft(baseId, ro);
    const maxOrder = await this.prismaService.workflow.aggregate({
      where: { baseId, deletedTime: null },
      _max: { order: true },
    });

    const workflowId = generateWorkflowId();
    const triggerId = generateWorkflowTriggerId();
    const actionIds = (
      draft.actions?.length
        ? draft.actions
        : [{ kind: draft.actionKind, config: draft.actionConfig }]
    ).map(() => generateWorkflowActionId());
    const actions = draft.actions?.length
      ? draft.actions
      : [{ kind: draft.actionKind, config: draft.actionConfig }];

    await this.prismaService.$tx(async (prisma) => {
      await prisma.workflow.create({
        data: {
          id: workflowId,
          baseId,
          name: draft.name,
          description: draft.description,
          order: (maxOrder._max.order ?? 0) + 1,
          createdBy: this.userId,
          lastModifiedBy: this.userId,
        },
      });

      await prisma.workflowNode.createMany({
        data: [
          {
            id: triggerId,
            workflowId,
            nodeType: 'trigger',
            kind: draft.triggerType,
            nextNodeId: actionIds[0],
            config: {
              tableId: ro.tableId,
              fieldId: ro.fieldId,
              recordId: ro.recordId,
              ...(draft.fieldMappings ? { fieldMappings: draft.fieldMappings } : {}),
              ...(draft.testPlan ? { testPlan: draft.testPlan } : {}),
              ...(draft.triggerConfig ?? {}),
              source: 'aiDraft',
            } as Prisma.InputJsonValue,
            createdBy: this.userId,
            lastModifiedBy: this.userId,
          },
          ...actions.map((action, index) => ({
            id: actionIds[index],
            workflowId,
            nodeType: 'action' as const,
            kind: action.kind,
            parentNodeId: index === 0 ? triggerId : actionIds[index - 1],
            nextNodeId: actionIds[index + 1],
            config: { ...action.config, source: 'aiDraft' } as Prisma.InputJsonValue,
            createdBy: this.userId,
            lastModifiedBy: this.userId,
          })),
        ],
      });
    });

    return this.getWorkflow(baseId, workflowId);
  }

  private async generateWorkflowDraft(
    baseId: string,
    ro: IAiCreateWorkflowDraftRo
  ): Promise<IGeneratedWorkflowDraft> {
    const fallback = this.createFallbackDraft(ro.prompt);
    const prompt = [
      'Create a Teable automation workflow draft.',
      'Return only compact JSON with keys: name, description, triggerType, triggerConfig, actionKind, actionConfig, optional actions, optional fieldMappings, optional testPlan.',
      'The workflow must be inactive until a user reviews and activates it.',
      'Prefer Run Script when it fits, but allow aiGenerate, updateRecords, createRecords, queryRecords, sendEmail, httpRequest, condition, or loop when the request strongly points there.',
      'Valid triggerType values: buttonClick, recordCreated, recordUpdated, recordMatchesConditions, schedule, webhook, formSubmitted, emailReceived.',
      'Valid actionKind values: runScript, aiGenerate, updateRecords, createRecords, queryRecords, sendEmail, httpRequest, condition, loop.',
      'For runScript, actionConfig should include script.',
      'For aiGenerate, actionConfig should include prompt and optional modelKey.',
      'For sendEmail, actionConfig should include to, subject, and text or html.',
      'For httpRequest, actionConfig should include method, url, optional headers, optional body, and optional timeoutMs.',
      'For condition, actionConfig should include expression and optional output.',
      'For loop, actionConfig should include itemsPath and optional maxIterations.',
      'When multiple actions are helpful, return actions as an ordered array of { kind, config }.',
      'fieldMappings may map semantic names to template expressions such as recordId -> {{ input.record.id }}.',
      'testPlan may include input, expectedActionKinds, and activationChecks so the draft is easier to review and test before activation.',
      'Do not include network requests, secrets, imports, require, eval, filesystem access, or destructive operations.',
      `User request: ${ro.prompt}`,
      `Context: ${JSON.stringify({
        tableId: ro.tableId,
        fieldId: ro.fieldId,
        recordId: ro.recordId,
        triggerType: ro.triggerType,
        preferActionKind: ro.preferActionKind,
      })}`,
    ].join('\n');

    try {
      const text = await this.workflowAiService.createWorkflowDraft(baseId, prompt, {
        tableId: ro.tableId,
        fieldId: ro.fieldId,
        recordId: ro.recordId,
        triggerType: ro.triggerType,
        preferActionKind: ro.preferActionKind,
        ...(ro.modelKey && { modelKey: ro.modelKey }),
      });
      return this.normalizeGeneratedDraft(text, fallback);
    } catch {
      return fallback;
    }
  }

  private normalizeGeneratedDraft(text: string, fallback: IGeneratedWorkflowDraft) {
    try {
      const jsonText = text
        .replace(/^```(?:json)?/i, '')
        .replace(/```$/, '')
        .trim();
      const parsed = JSON.parse(jsonText) as Partial<IGeneratedWorkflowDraft>;
      const name =
        typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name.trim() : fallback.name;
      const description =
        typeof parsed.description === 'string' && parsed.description.trim()
          ? parsed.description.trim()
          : fallback.description;
      const triggerType = this.normalizeDraftTriggerType(parsed.triggerType, fallback.triggerType);
      const actionKind = this.normalizeDraftActionKind(parsed.actionKind, fallback.actionKind);
      const triggerConfig =
        parsed.triggerConfig &&
        typeof parsed.triggerConfig === 'object' &&
        !Array.isArray(parsed.triggerConfig)
          ? (parsed.triggerConfig as Record<string, unknown>)
          : fallback.triggerConfig;
      const actionConfig = this.normalizeDraftActionConfig(
        actionKind,
        parsed.actionConfig,
        fallback.actionConfig
      );
      const actions = this.normalizeGeneratedDraftActions(parsed.actions, actionKind, actionConfig);
      const fieldMappings = this.normalizeGeneratedDraftFieldMappings(parsed.fieldMappings);
      const testPlan = this.normalizeGeneratedDraftTestPlan(parsed.testPlan);

      return {
        name: name.slice(0, 100),
        description: description.slice(0, 500),
        triggerType,
        triggerConfig,
        actionKind,
        actionConfig,
        ...(actions?.length ? { actions } : {}),
        ...(fieldMappings && Object.keys(fieldMappings).length ? { fieldMappings } : {}),
        ...(testPlan ? { testPlan } : {}),
      };
    } catch {
      return fallback;
    }
  }

  private normalizeGeneratedDraftActions(
    actions: unknown,
    fallbackKind: IAiDraftActionKind,
    fallbackConfig: Record<string, unknown>
  ): IGeneratedWorkflowDraftAction[] | undefined {
    if (!Array.isArray(actions)) {
      return undefined;
    }

    return actions
      .map((action) => {
        if (!action || typeof action !== 'object' || Array.isArray(action)) {
          return null;
        }
        const candidate = action as { kind?: unknown; config?: unknown };
        const kind = this.normalizeDraftActionKind(candidate.kind, fallbackKind);
        return {
          kind,
          config: this.normalizeDraftActionConfig(kind, candidate.config, fallbackConfig),
        };
      })
      .filter((action): action is IGeneratedWorkflowDraftAction => Boolean(action));
  }

  private normalizeGeneratedDraftFieldMappings(fieldMappings: unknown) {
    if (!fieldMappings || typeof fieldMappings !== 'object' || Array.isArray(fieldMappings)) {
      return undefined;
    }

    return Object.fromEntries(
      Object.entries(fieldMappings as Record<string, unknown>).filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string'
      )
    );
  }

  private normalizeGeneratedDraftTestPlan(testPlan: unknown) {
    if (!testPlan || typeof testPlan !== 'object' || Array.isArray(testPlan)) {
      return undefined;
    }

    return testPlan as IWorkflowTestPlan;
  }

  private createFallbackDraft(prompt: string) {
    const name = `AI draft: ${prompt.trim().slice(0, 40) || 'Run script'}`;
    return {
      name,
      description: 'Inactive AI-created workflow draft. Review the script before activation.',
      triggerType: 'buttonClick' as const,
      triggerConfig: { source: 'aiDraft' },
      actionKind: 'runScript' as const,
      actionConfig: {
        script: [
          'console.log("AI-created workflow draft input", input);',
          'return {',
          '  reviewed: false,',
          '  message: "Review and replace this draft script before activating the workflow.",',
          '  input,',
          '};',
        ].join('\n'),
      },
    };
  }

  private normalizeDraftTriggerType(
    value: unknown,
    fallback: IAiDraftTriggerType
  ): IAiDraftTriggerType {
    const allowed: IAiDraftTriggerType[] = [
      'buttonClick',
      'recordCreated',
      'recordUpdated',
      'recordMatchesConditions',
      'schedule',
      'webhook',
      'formSubmitted',
      'emailReceived',
    ];
    return typeof value === 'string' && allowed.includes(value as IAiDraftTriggerType)
      ? (value as IAiDraftTriggerType)
      : fallback;
  }

  private normalizeDraftActionKind(
    value: unknown,
    fallback: IAiDraftActionKind
  ): IAiDraftActionKind {
    const allowed: IAiDraftActionKind[] = [
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
    return typeof value === 'string' && allowed.includes(value as IAiDraftActionKind)
      ? (value as IAiDraftActionKind)
      : fallback;
  }

  private normalizeDraftActionConfig(
    kind: IAiDraftActionKind,
    value: unknown,
    fallback: Record<string, unknown>
  ) {
    const config =
      value && typeof value === 'object' && !Array.isArray(value)
        ? ({ ...(value as Record<string, unknown>) } as Record<string, unknown>)
        : { ...fallback };
    if (kind === 'runScript') {
      const script = typeof config.script === 'string' ? config.script : undefined;
      return {
        ...config,
        script: this.sanitizeDraftScript(script ?? String(fallback.script ?? '')),
      };
    }
    if (kind === 'loop') {
      const itemsPath = typeof config.itemsPath === 'string' ? config.itemsPath.trim() : '';
      return {
        itemsPath: itemsPath || '{{ input.items }}',
        maxIterations:
          typeof config.maxIterations === 'number' && Number.isInteger(config.maxIterations)
            ? config.maxIterations
            : 20,
      };
    }
    return config;
  }

  private sanitizeDraftScript(script: string) {
    const deniedPatterns = [
      /\brequire\s*\(/,
      /\bimport\s+/,
      /\beval\s*\(/,
      /\bFunction\s*\(/,
      /process\./,
    ];
    if (deniedPatterns.some((pattern) => pattern.test(script))) {
      return String(this.createFallbackDraft('Run script').actionConfig.script ?? 'return input;');
    }
    return script.slice(0, 8000);
  }

  private buildWebhookSignaturePayload(input: { timestamp?: string; rawBody: string }) {
    return [input.timestamp ?? '', input.rawBody].join('.');
  }

  private verifyWebhookSignature(
    config: IWebhookTriggerConfig | null,
    options?: {
      signature?: string;
      timestamp?: string;
      rawBody?: string;
    }
  ) {
    if (!config?.signatureSecret) {
      return;
    }
    if (!options?.signature || !options.rawBody) {
      throw new CustomHttpException(
        'Missing webhook signature headers',
        HttpErrorCode.UNAUTHORIZED
      );
    }
    if (!options.timestamp) {
      throw new CustomHttpException('Missing webhook timestamp header', HttpErrorCode.UNAUTHORIZED);
    }
    this.assertWebhookTimestamp(config, options.timestamp);
    const normalizedSignature = options.signature.replace(/^sha256=/i, '');
    const normalizedExpected = createHmac('sha256', config.signatureSecret)
      .update(
        this.buildWebhookSignaturePayload({
          timestamp: options.timestamp,
          rawBody: options.rawBody,
        })
      )
      .digest('hex');
    if (normalizedSignature !== normalizedExpected) {
      throw new CustomHttpException('Invalid webhook signature', HttpErrorCode.UNAUTHORIZED);
    }
  }

  private assertWebhookTimestamp(config: IWebhookTriggerConfig | null, timestamp: string) {
    const value = Number(timestamp);
    if (!Number.isFinite(value)) {
      throw new CustomHttpException('Invalid webhook timestamp', HttpErrorCode.UNAUTHORIZED);
    }
    const toleranceSeconds = config?.timestampToleranceSeconds ?? 300;
    if (toleranceSeconds <= 0) {
      return;
    }
    const nowSeconds = Math.floor(Date.now() / 1000);
    if (Math.abs(nowSeconds - value) > toleranceSeconds) {
      throw new CustomHttpException('Webhook timestamp expired', HttpErrorCode.UNAUTHORIZED);
    }
  }

  private assertWebhookBodySize(config: IWebhookTriggerConfig | null, input: unknown) {
    const limitKb = config?.bodySizeLimitKb;
    if (!limitKb || limitKb <= 0) {
      return;
    }
    const sizeBytes = Buffer.byteLength(JSON.stringify(input ?? null), 'utf8');
    if (sizeBytes > limitKb * 1024) {
      throw new CustomHttpException(
        'Webhook body exceeds configured size limit',
        HttpErrorCode.PAYLOAD_TOO_LARGE
      );
    }
  }

  async updateWorkflow(
    baseId: string,
    workflowId: string,
    ro: IUpdateWorkflowRo
  ): Promise<IWorkflowVo> {
    const workflow = await this.prismaService.workflow
      .findFirstOrThrow({
        where: { id: workflowId, baseId, deletedTime: null },
        select: { id: true },
      })
      .catch(() => {
        throw new CustomHttpException(workflowNotFoundMessage, HttpErrorCode.NOT_FOUND, {
          localization: workflowNotFoundLocalization,
        });
      });

    const result = await this.prismaService.$tx(async (prisma) => {
      if (ro.nodes) {
        const nextNodeIds = ro.nodes.map((node) => node.id);
        await prisma.workflowNode.deleteMany({
          where: {
            workflowId: workflow.id,
            id: { notIn: nextNodeIds },
          },
        });
        await Promise.all(
          ro.nodes.map((node) =>
            prisma.workflowNode.upsert({
              where: { id: node.id },
              create: {
                id: node.id,
                workflowId: workflow.id,
                nodeType: node.nodeType,
                kind: node.kind,
                parentNodeId: node.parentNodeId,
                nextNodeId: node.nextNodeId,
                branchKey: node.branchKey,
                config: node.config as Prisma.InputJsonValue,
                createdBy: this.userId,
                lastModifiedBy: this.userId,
              },
              update: {
                workflowId: workflow.id,
                nodeType: node.nodeType,
                kind: node.kind,
                parentNodeId: node.parentNodeId,
                nextNodeId: node.nextNodeId,
                branchKey: node.branchKey,
                config: node.config as Prisma.InputJsonValue,
                lastModifiedBy: this.userId,
              },
            })
          )
        );
      }

      return await prisma.workflow.update({
        where: { id: workflowId },
        data: {
          ...(ro.name !== undefined && { name: ro.name }),
          ...(ro.description !== undefined && { description: ro.description }),
          lastModifiedBy: this.userId,
        },
        select: this.selectWorkflow(),
      });
    });

    if (result.isActive) {
      const refreshedWorkflow = await this.getWorkflow(baseId, workflowId);
      await this.syncWorkflowScheduleIfActive(refreshedWorkflow);
    }
    return result;
  }

  async deleteWorkflow(baseId: string, workflowId: string, permanent = false): Promise<void> {
    const workflow = await this.prismaService.workflow.findFirst({
      where: { id: workflowId, baseId, deletedTime: null },
      select: { id: true },
    });
    if (!workflow) {
      throw new CustomHttpException(workflowNotFoundMessage, HttpErrorCode.NOT_FOUND, {
        localization: workflowNotFoundLocalization,
      });
    }

    if (permanent) {
      await this.prismaService.workflow.delete({ where: { id: workflowId } });
      await this.workflowScheduleService.removeWorkflowSchedule(workflowId);
      return;
    }

    await this.prismaService.workflow.update({
      where: { id: workflowId },
      data: {
        deletedTime: new Date(),
        lastModifiedBy: this.userId,
      },
    });
    await this.workflowScheduleService.removeWorkflowSchedule(workflowId);
  }

  async duplicateWorkflow(
    baseId: string,
    workflowId: string,
    ro: IDuplicateWorkflowRo = {}
  ): Promise<IWorkflowVo> {
    const source = await this.getWorkflow(baseId, workflowId);
    const names = (await this.getWorkflowList(baseId)).map(({ name }) => name);
    const name = ro.name ?? getUniqName(source.name, names);
    const maxOrder = await this.prismaService.workflow.aggregate({
      where: { baseId, deletedTime: null },
      _max: { order: true },
    });

    return this.prismaService.$tx(async (prisma) => {
      const workflow = await prisma.workflow.create({
        data: {
          id: generateWorkflowId(),
          baseId,
          name,
          description: source.description,
          order: (maxOrder._max.order ?? 0) + 1,
          createdBy: this.userId,
          lastModifiedBy: this.userId,
        },
        select: this.selectWorkflow(),
      });

      if (source.nodes.length) {
        await prisma.workflowNode.createMany({
          data: source.nodes.map((node) => ({
            id: generateWorkflowActionId(),
            workflowId: workflow.id,
            nodeType: node.nodeType,
            kind: node.kind,
            parentNodeId: node.parentNodeId,
            nextNodeId: node.nextNodeId,
            branchKey: node.branchKey,
            config: node.config as Prisma.InputJsonValue,
            testStatus: node.testStatus,
            testOutput: node.testOutput as Prisma.InputJsonValue,
            createdBy: this.userId,
            lastModifiedBy: this.userId,
          })),
        });
      }

      return workflow;
    });
  }

  async activateWorkflow(baseId: string, workflowId: string): Promise<IWorkflowVo> {
    const workflow = await this.getWorkflow(baseId, workflowId);
    this.assertWorkflowCanActivate(workflow);
    const version = await this.getNextSnapshotVersion(workflowId);

    const activated = await this.prismaService.$tx(async (prisma) => {
      const snapshot = await prisma.workflowSnapshot.create({
        data: {
          workflowId,
          version,
          snapshot: workflow as Prisma.InputJsonValue,
          createdBy: this.userId,
        },
        select: { id: true },
      });

      return prisma.workflow.update({
        where: { id: workflowId },
        data: {
          isActive: true,
          activeSnapshotId: snapshot.id,
          lastModifiedBy: this.userId,
        },
        select: this.selectWorkflow(),
      });
    });

    const refreshedWorkflow = await this.getWorkflow(baseId, workflowId);
    await this.workflowScheduleService.syncWorkflowSchedule(refreshedWorkflow);
    return activated;
  }

  async applyUpdateWorkflow(baseId: string, workflowId: string): Promise<IWorkflowVo> {
    const workflow = await this.getWorkflow(baseId, workflowId);
    if (!workflow.isActive) {
      throw new CustomHttpException(
        'Workflow must be active before applying draft updates',
        HttpErrorCode.VALIDATION_ERROR
      );
    }
    this.assertWorkflowCanActivate(workflow);

    const updated = await this.prismaService.$tx(async (prisma) => {
      const snapshotId = await this.createWorkflowSnapshot(workflowId, workflow);
      return prisma.workflow.update({
        where: { id: workflowId },
        data: {
          isActive: true,
          activeSnapshotId: snapshotId,
          lastModifiedBy: this.userId,
        },
        select: this.selectWorkflow(),
      });
    });

    const refreshedWorkflow = await this.getWorkflow(baseId, workflowId);
    await this.workflowScheduleService.syncWorkflowSchedule(refreshedWorkflow);
    return updated;
  }

  async deactivateWorkflow(baseId: string, workflowId: string): Promise<IWorkflowVo> {
    await this.getWorkflow(baseId, workflowId);
    const deactivated = await this.prismaService.workflow.update({
      where: { id: workflowId },
      data: {
        isActive: false,
        lastModifiedBy: this.userId,
      },
      select: this.selectWorkflow(),
    });

    await this.workflowScheduleService.removeWorkflowSchedule(workflowId);
    return deactivated;
  }

  async listActiveScheduleWorkflows(): Promise<IWorkflowDetailVo[]> {
    const workflows = await this.prismaService.workflow.findMany({
      where: {
        deletedTime: null,
        isActive: true,
        activeSnapshotId: { not: null },
        nodes: {
          some: {
            nodeType: 'trigger',
            kind: 'schedule',
          },
        },
      },
      select: {
        ...this.selectWorkflow(),
        nodes: {
          select: this.selectWorkflowNode(),
          orderBy: { createdTime: 'asc' },
        },
      },
    });

    return workflows.map((workflow) => ({
      ...workflow,
      nodes: workflow.nodes.map((node) => ({
        ...node,
        nodeType: node.nodeType as 'trigger' | 'action' | 'logic',
      })),
    }));
  }

  getScheduleTriggerConfig(
    workflow: Pick<IWorkflowDetailVo, 'nodes'>
  ): IScheduleTriggerConfig | undefined {
    const trigger = workflow.nodes.find(
      (node) => node.nodeType === 'trigger' && node.kind === 'schedule'
    );
    const config = (trigger?.config as IScheduleTriggerConfig | null) ?? undefined;
    if (!config) {
      return undefined;
    }

    return {
      mode: config.mode ?? 'manual',
      intervalSeconds:
        typeof config.intervalSeconds === 'number' && Number.isFinite(config.intervalSeconds)
          ? config.intervalSeconds
          : undefined,
      cron: typeof config.cron === 'string' && config.cron.trim() ? config.cron.trim() : undefined,
    };
  }

  private async syncWorkflowScheduleIfActive(workflow: IWorkflowDetailVo) {
    if (!workflow.isActive) {
      return;
    }

    await this.workflowScheduleService.syncWorkflowSchedule(workflow);
  }

  async createButtonRun(workflowId: string, input: unknown): Promise<{ runId: string }> {
    return this.createDirectTriggerRun(workflowId, 'buttonClick', input);
  }

  async createWebhookRun(
    workflowId: string,
    input: unknown,
    options?: { secret?: string; signature?: string; timestamp?: string; rawBody?: string }
  ): Promise<{ runId: string }> {
    const workflow = await this.getDirectTriggerWorkflow(workflowId, 'webhook');
    const triggerConfig = (workflow.nodes[0]?.config as IWebhookTriggerConfig | null) ?? null;
    this.assertWebhookSecret(triggerConfig, options?.secret);
    this.verifyWebhookSignature(triggerConfig, options);
    this.assertWebhookBodySize(triggerConfig, input);
    await this.assertWebhookRateLimit(workflow.id);
    return this.createDirectTriggerRunFromWorkflow(workflow, 'webhook', input);
  }

  async createScheduleRun(workflowId: string, input: unknown): Promise<{ runId: string }> {
    return this.createDirectTriggerRun(workflowId, 'schedule', input);
  }

  async createFormSubmittedRun(workflowId: string, input: unknown): Promise<{ runId: string }> {
    return this.createDirectTriggerRun(workflowId, 'formSubmitted', input);
  }

  async createEmailReceivedRun(workflowId: string, input: unknown): Promise<{ runId: string }> {
    return this.createDirectTriggerRun(workflowId, 'emailReceived', input);
  }

  private async getDirectTriggerWorkflow(workflowId: string, triggerType: IDirectTriggerType) {
    const workflow = await this.prismaService.workflow
      .findFirstOrThrow({
        where: { id: workflowId, deletedTime: null, isActive: true },
        select: {
          id: true,
          baseId: true,
          activeSnapshotId: true,
          nodes: {
            where: { nodeType: 'trigger' },
            select: { kind: true, config: true },
            take: 1,
          },
        },
      })
      .catch(() => {
        throw new CustomHttpException('Workflow not found or inactive', HttpErrorCode.NOT_FOUND, {
          localization: workflowNotFoundLocalization,
        });
      });

    if (!workflow.nodes.some((node) => node.kind === triggerType)) {
      throw new CustomHttpException(
        `Workflow does not use ${triggerType} trigger`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    return workflow;
  }

  private assertWebhookSecret(config: unknown, providedSecret?: string) {
    const webhookConfig = config as IWebhookTriggerConfig | null;
    if (!webhookConfig?.secret) {
      return;
    }
    if (providedSecret !== webhookConfig.secret) {
      throw new CustomHttpException('Invalid webhook secret', HttpErrorCode.UNAUTHORIZED);
    }
  }

  private async assertWebhookRateLimit(workflowId: string) {
    const rateLimit = this.thresholdConfig.webhook.workflowRateLimit;
    if (rateLimit <= 0) {
      return;
    }

    const cacheKey = `workflow:webhook-rate:${workflowId}` as const;
    const count = await this.cacheService.incr(cacheKey, 1);
    if (count > rateLimit) {
      throw new CustomHttpException('Webhook rate limit exceeded', HttpErrorCode.TOO_MANY_REQUESTS);
    }
  }

  private async createDirectTriggerRunFromWorkflow(
    workflow: { id: string; baseId: string; activeSnapshotId: string | null },
    triggerType: IDirectTriggerType,
    input: unknown
  ): Promise<{ runId: string }> {
    const run = await this.prismaService.workflowRun.create({
      data: {
        workflowId: workflow.id,
        snapshotId: workflow.activeSnapshotId,
        triggerType,
        status: 'pending',
        input: {
          ...(typeof input === 'object' && input != null ? input : { value: input }),
          __automationContext: {
            source: 'automation',
            workflowId: workflow.id,
            baseId: workflow.baseId,
            timestamp: new Date().toISOString(),
          },
        } as Prisma.InputJsonValue,
        createdBy: this.userId,
      },
      select: { id: true },
    });

    return { runId: run.id };
  }

  private async createDirectTriggerRun(
    workflowId: string,
    triggerType: IDirectTriggerType,
    input: unknown
  ): Promise<{ runId: string }> {
    const workflow = await this.getDirectTriggerWorkflow(workflowId, triggerType);
    return this.createDirectTriggerRunFromWorkflow(workflow, triggerType, input);
  }

  async createRecordTriggerRuns(
    tableId: string,
    triggerType: IRecordTriggerType,
    input: unknown
  ): Promise<{ runId: string; workflowId: string }[]> {
    const table = await this.prismaService.tableMeta.findFirst({
      where: { id: tableId, deletedTime: null },
      select: { baseId: true },
    });
    if (!table) {
      return [];
    }

    const workflows = await this.prismaService.workflow.findMany({
      where: {
        baseId: table.baseId,
        deletedTime: null,
        isActive: true,
        activeSnapshotId: { not: null },
        nodes: {
          some: {
            nodeType: 'trigger',
            kind: triggerType,
          },
        },
      },
      select: {
        id: true,
        activeSnapshotId: true,
        nodes: {
          where: {
            nodeType: 'trigger',
            kind: triggerType,
          },
          select: { config: true },
        },
      },
    });

    const matchedWorkflows = (
      await Promise.all(
        workflows.map(async (workflow) => {
          const isMatched = await this.matchRecordTriggerNodes(
            workflow.nodes,
            tableId,
            triggerType,
            input
          );
          return isMatched ? workflow : undefined;
        })
      )
    ).filter((workflow): workflow is (typeof workflows)[number] => Boolean(workflow));

    if (!matchedWorkflows.length) {
      return [];
    }

    const runs = await Promise.all(
      matchedWorkflows.map((workflow) =>
        this.prismaService.workflowRun.create({
          data: {
            workflowId: workflow.id,
            snapshotId: workflow.activeSnapshotId,
            triggerType,
            status: 'pending',
            input: {
              ...(typeof input === 'object' && input != null ? input : { value: input }),
              __automationContext: {
                source: 'automation',
                workflowId: workflow.id,
                baseId: table.baseId,
                timestamp: new Date().toISOString(),
              },
            } as Prisma.InputJsonValue,
            createdBy: this.userId,
          },
          select: { id: true, workflowId: true },
        })
      )
    );

    return runs.map((run) => ({ runId: run.id, workflowId: run.workflowId }));
  }

  private matchRecordTriggerConfig(config: unknown, tableId: string) {
    const triggerConfig = config as IRecordTriggerConfig | null;
    return !triggerConfig?.tableId || triggerConfig.tableId === tableId;
  }

  private async matchRecordTriggerNodes(
    nodes: { config: unknown }[],
    tableId: string,
    triggerType: IRecordTriggerType,
    input: unknown
  ) {
    for (const node of nodes) {
      if (await this.matchRecordTriggerNode(node.config, tableId, triggerType, input)) {
        return true;
      }
    }
    return false;
  }

  private async matchRecordTriggerNode(
    config: unknown,
    tableId: string,
    triggerType: IRecordTriggerType,
    input: unknown
  ) {
    if (!this.matchRecordTriggerConfig(config, tableId)) {
      return false;
    }

    const triggerConfig = config as IRecordTriggerConfig | null;
    if (triggerType === 'recordMatchesConditions' && this.isRecordMatchesConditionsInput(input)) {
      return this.matchRecordTransitionTriggerNode(triggerConfig, tableId, input);
    }

    if (!triggerConfig?.filter) {
      return true;
    }

    const recordIds = this.getInputRecordIds(input);
    if (!recordIds.length) {
      return false;
    }

    const matchedRecordIds = await this.recordService.filterRecordIdsByFilter(
      tableId,
      recordIds,
      triggerConfig.filter
    );
    return matchedRecordIds.length > 0;
  }

  private async matchRecordTransitionTriggerNode(
    triggerConfig: IRecordTriggerConfig | null,
    tableId: string,
    input: {
      tableId: string;
      record: { id: string; fields: Record<string, { oldValue?: unknown; newValue?: unknown }> };
    }
  ) {
    if (!triggerConfig?.filter) {
      return false;
    }

    const beforeRecord = this.buildTransitionRecord(input, 'oldValue');
    const afterRecord = this.buildTransitionRecord(input, 'newValue');
    const beforeMatches = this.matchRecordTransitionFilter(
      triggerConfig.filter,
      beforeRecord.fields
    );
    const afterMatches = this.matchRecordTransitionFilter(triggerConfig.filter, afterRecord.fields);
    return !beforeMatches && afterMatches;
  }

  private matchRecordTransitionFilter(filter: IFilter, fields: Record<string, unknown>) {
    if (!filter || filter.conjunction !== 'and' || !Array.isArray(filter.filterSet)) {
      return false;
    }

    return filter.filterSet.every((item) => {
      if (!item || typeof item !== 'object' || 'filterSet' in item) {
        return false;
      }

      const { fieldId, operator, value } = item as {
        fieldId?: unknown;
        operator?: unknown;
        value?: unknown;
      };

      if (typeof fieldId !== 'string' || operator !== 'is') {
        return false;
      }

      return fields[fieldId] === value;
    });
  }

  private buildTransitionRecord(
    input: {
      record: { id: string; fields: Record<string, { oldValue?: unknown; newValue?: unknown }> };
    },
    valueKey: 'oldValue' | 'newValue'
  ) {
    return {
      id: input.record.id,
      fields: Object.fromEntries(
        Object.entries(input.record.fields ?? {}).map(([fieldId, value]) => [
          fieldId,
          value?.[valueKey],
        ])
      ),
    };
  }

  private isRecordMatchesConditionsInput(input: unknown): input is {
    tableId: string;
    record: { id: string; fields: Record<string, { oldValue?: unknown; newValue?: unknown }> };
  } {
    const record = (input as { record?: unknown } | null)?.record;
    if (!record || typeof record !== 'object') {
      return false;
    }
    const fields = (record as { fields?: unknown }).fields;
    return Boolean(fields && typeof fields === 'object' && !Array.isArray(fields));
  }

  private getInputRecordIds(input: unknown) {
    const record = (input as { record?: unknown } | null)?.record;
    const records = Array.isArray(record) ? record : record ? [record] : [];
    return records
      .map((item) => (item as { id?: unknown } | null)?.id)
      .filter((id): id is string => typeof id === 'string' && Boolean(id));
  }

  private assertWorkflowCanActivate(workflow: IWorkflowDetailVo) {
    const trigger = workflow.nodes.find((node) => node.nodeType === 'trigger');
    if (!trigger) {
      throw new CustomHttpException(
        'Workflow requires a trigger before activation',
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    const actions = workflow.nodes.filter((node) => node.nodeType === 'action');
    if (!actions.length) {
      throw new CustomHttpException(
        'Workflow requires at least one action before activation',
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    const invalidAction = actions.find(
      (action) => !this.isRunnableAction(action.kind, action.config)
    );
    if (invalidAction) {
      throw new CustomHttpException(
        `Workflow action ${invalidAction.kind} is not runnable`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }
  }

  private isRunnableAction(kind: string, config: unknown) {
    const capability = getWorkflowActionCapability(kind);
    if (!capability?.runnable) {
      return false;
    }

    const actionConfig = config as IWorkflowActionConfig | null;
    if (kind === 'runScript') {
      return Boolean(actionConfig?.script || actionConfig?.code);
    }
    if (kind === 'aiGenerate') {
      return Boolean(actionConfig?.prompt);
    }
    return false;
  }

  async createTestRun(baseId: string, workflowId: string, input: unknown): Promise<IWorkflowRunVo> {
    const workflow = await this.getWorkflow(baseId, workflowId);
    const snapshotId =
      workflow.activeSnapshotId ?? (await this.createWorkflowSnapshot(workflowId, workflow));
    const runInput =
      input ??
      ({
        manual: true,
        source: 'workflowTestRun',
        workflowId,
      } as const);

    return this.prismaService.workflowRun.create({
      data: {
        workflowId,
        snapshotId,
        triggerType: 'manualTest',
        status: 'pending',
        input: {
          ...runInput,
          __automationContext: {
            source: 'automation',
            workflowId,
            baseId,
            timestamp: new Date().toISOString(),
          },
        } as Prisma.InputJsonValue,
        createdBy: this.userId,
      },
      select: this.selectWorkflowRun(),
    });
  }

  async createTestNodeRun(
    baseId: string,
    workflowId: string,
    nodeId: string,
    input: unknown
  ): Promise<IWorkflowRunVo> {
    const workflow = await this.getWorkflow(baseId, workflowId);
    const targetNode = workflow.nodes.find((node) => node.id === nodeId);
    if (!targetNode || targetNode.nodeType !== 'action') {
      throw new CustomHttpException('Workflow action node not found', HttpErrorCode.NOT_FOUND, {
        localization: workflowNotFoundLocalization,
      });
    }

    const nodeIds = new Set<string>();
    let currentNode = targetNode;
    while (currentNode) {
      nodeIds.add(currentNode.id);
      if (!currentNode.parentNodeId) {
        break;
      }
      const parentNode = workflow.nodes.find((node) => node.id === currentNode.parentNodeId);
      if (!parentNode) {
        break;
      }
      currentNode = parentNode;
    }

    const snapshotWorkflow = {
      ...workflow,
      nodes: workflow.nodes.filter((node) => nodeIds.has(node.id)),
    };
    const snapshotId = await this.createWorkflowSnapshot(workflowId, snapshotWorkflow);
    const runInput =
      input ??
      ({
        manual: true,
        source: 'workflowNodeTestRun',
        workflowId,
        nodeId,
      } as const);

    return this.prismaService.workflowRun.create({
      data: {
        workflowId,
        snapshotId,
        triggerType: 'manualNodeTest',
        status: 'pending',
        input: {
          ...runInput,
          __automationContext: {
            source: 'automation',
            workflowId,
            baseId,
            timestamp: new Date().toISOString(),
          },
        } as Prisma.InputJsonValue,
        createdBy: this.userId,
      },
      select: this.selectWorkflowRun(),
    });
  }

  private async createWorkflowSnapshot(
    workflowId: string,
    workflow: IWorkflowDetailVo
  ): Promise<string> {
    const version = await this.getNextSnapshotVersion(workflowId);
    const snapshot = await this.prismaService.workflowSnapshot.create({
      data: {
        workflowId,
        version,
        snapshot: workflow as Prisma.InputJsonValue,
        createdBy: this.userId,
      },
      select: { id: true },
    });
    return snapshot.id;
  }

  private async getNextSnapshotVersion(workflowId: string) {
    const latest = await this.prismaService.workflowSnapshot.aggregate({
      where: { workflowId },
      _max: { version: true },
    });
    return (latest._max.version ?? 0) + 1;
  }

  async completeEmptyRun(runId: string): Promise<void> {
    const startedTime = new Date();
    await this.prismaService.workflowRun.update({
      where: { id: runId },
      data: {
        startedTime,
        ...buildWorkflowRunSuccessData(startedTime, startedTime, {
          skipped: true,
          reason: 'No workflow runner actions are implemented yet',
        }),
      },
    });
  }
}
