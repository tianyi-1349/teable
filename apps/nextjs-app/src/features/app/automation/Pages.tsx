import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  IWorkflowDetailVo,
  IWorkflowNode,
  IWorkflowRunDetailVo,
  IWorkflowVo,
} from '@teable/openapi';
import {
  activateWorkflow,
  aiCreateWorkflowDraft,
  applyUpdateWorkflow,
  createWorkflow,
  deactivateWorkflow,
  deleteWorkflow,
  getWorkflow,
  getWorkflowCapabilities,
  getWorkflowList,
  getWorkflowRun,
  getWorkflowRunList,
  testNodeWorkflow,
  testRunWorkflow,
  triggerEmailReceivedWorkflow,
  triggerFormSubmittedWorkflow,
  triggerScheduleWorkflow,
  triggerWebhookWorkflow,
  updateWorkflow,
} from '@teable/openapi';
import { ReactQueryKeys } from '@teable/sdk/config';
import { useBaseId, useIsReadOnlyPreview } from '@teable/sdk/hooks';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  cn,
} from '@teable/ui-lib/shadcn';
import { toast } from '@teable/ui-lib/shadcn/ui/sonner';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';
import { formatJson, getStatusTone } from './lib/runHistory';
import {
  appendActionNode,
  getActiveActionNodeId,
  getAiGeneratePrompt,
  getFirstActionNodeId,
  getRecordTriggerFilterText,
  getRecordTriggerKind,
  getRecordTriggerTableId,
  getScriptPreview,
  hasSelectedActionNode,
  type IConditionActionConfig,
  type IHttpRequestActionConfig,
  type ILoopActionConfig,
  removeActionNode,
  type IRecordCreateActionConfig,
  type IRecordQueryActionConfig,
  type IRecordUpdateActionConfig,
  type ISendEmailActionConfig,
  type WorkflowActionKind,
  type WorkflowRecordTriggerKind,
} from './lib/workflowNodes';

type WorkflowRecordActionKind = 'updateRecords' | 'createRecords' | 'queryRecords';
type WorkflowGenericActionKind = 'sendEmail' | 'httpRequest' | 'condition' | 'loop';

type IScheduleTriggerConfig = {
  mode?: 'manual' | 'interval' | 'cron';
  intervalSeconds?: number;
  cron?: string;
};

type IWebhookTriggerConfig = {
  secret?: string;
  signatureSecret?: string;
  bodySizeLimitKb?: number;
  timestampToleranceSeconds?: number;
  fieldMappings?: Record<string, string>;
  testPlan?: {
    input?: Record<string, unknown>;
    expectedActionKinds?: string[];
    activationChecks?: string[];
  };
};

const parseRecordActionDraft = (
  draft: string,
  kind: WorkflowRecordActionKind | undefined
): IRecordUpdateActionConfig | IRecordCreateActionConfig | IRecordQueryActionConfig | undefined => {
  if (!kind) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(draft) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return undefined;
    }
    return parsed as
      | IRecordUpdateActionConfig
      | IRecordCreateActionConfig
      | IRecordQueryActionConfig;
  } catch {
    return undefined;
  }
};

const stringifyRecordActionDraft = (config: unknown) => JSON.stringify(config, null, 2);
const stringifyGenericActionDraft = (config: unknown) => JSON.stringify(config, null, 2);

const tryParseJsonObject = (value: string, fallback: unknown) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

interface IWorkflowActionCapabilityMap {
  [kind: string]: {
    configurable: boolean;
    runnable: boolean;
    reason?: string;
  };
}

interface IAutomationPageProps {
  baseId?: string;
  workflowId?: string;
  headLeft?: React.ReactNode;
  onWorkflowChange?: (workflow?: IWorkflowDetailVo) => void;
}

const workflowListQueryKey = (baseId: string) => ['workflow-list', baseId] as const;
const workflowCapabilitiesQueryKey = (baseId: string) => ['workflow-capabilities', baseId] as const;
const workflowRunListQueryKey = (baseId: string, workflowId: string) =>
  ['workflow-run-list', baseId, workflowId] as const;
const workflowRunDetailQueryKey = (baseId: string, workflowId: string, runId: string) =>
  ['workflow-run-detail', baseId, workflowId, runId] as const;

const parseOptionalJson = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? JSON.parse(trimmed) : undefined;
};

const inferDraftPreferredActionKind = (prompt: string): WorkflowGenericActionKind | 'runScript' => {
  const normalizedPrompt = prompt.toLowerCase();
  if (normalizedPrompt.includes('email')) {
    return 'sendEmail';
  }
  if (normalizedPrompt.includes('http')) {
    return 'httpRequest';
  }
  if (normalizedPrompt.includes('condition')) {
    return 'condition';
  }
  if (normalizedPrompt.includes('loop') || normalizedPrompt.includes('for each')) {
    return 'loop';
  }
  return 'runScript';
};

const inferDraftTriggerType = (prompt: string) => {
  const normalizedPrompt = prompt.toLowerCase();
  if (normalizedPrompt.includes('webhook')) {
    return 'webhook' as const;
  }
  if (normalizedPrompt.includes('schedule')) {
    return 'schedule' as const;
  }
  if (normalizedPrompt.includes('email')) {
    return 'emailReceived' as const;
  }
  if (normalizedPrompt.includes('form')) {
    return 'formSubmitted' as const;
  }
  return 'buttonClick' as const;
};

const getRecordTriggerWorkflowName = (
  triggerType: WorkflowRecordTriggerKind,
  actionKind: 'runScript' | 'aiGenerate'
) => {
  if (actionKind === 'aiGenerate') {
    return 'Summarize new record with AI';
  }
  if (triggerType === 'recordCreated') {
    return 'When record is created';
  }
  if (triggerType === 'recordUpdated') {
    return 'When record is updated';
  }
  return 'When record matches conditions';
};

const buildRecordTriggerAction = (
  triggerType: WorkflowRecordTriggerKind,
  actionKind: 'runScript' | 'aiGenerate'
) => {
  if (actionKind === 'aiGenerate') {
    return {
      type: 'aiGenerate' as const,
      config: {
        prompt: 'Summarize this automation trigger input in one concise paragraph: {{ input }}',
      },
    };
  }

  return {
    type: 'runScript' as const,
    config: {
      script: [
        'console.log("Record trigger input", input);',
        'return {',
        `  triggerType: "${triggerType}",`,
        '  tableId: input.tableId,',
        '  record: input.record,',
        '};',
      ].join('\n'),
    },
  };
};

const parseStringRecordMap = (value: string) => {
  const parsedValue = parseOptionalJson(value);
  if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(parsedValue as Record<string, unknown>).filter(
      (entry): entry is [string, string] => typeof entry[1] === 'string'
    )
  );
};

const parseUnknownRecord = (value: string) => {
  const parsedValue = parseOptionalJson(value);
  if (!parsedValue || typeof parsedValue !== 'object' || Array.isArray(parsedValue)) {
    return undefined;
  }
  return parsedValue as Record<string, unknown>;
};

const parseStringArray = (value: string) => {
  const parsedValue = parseOptionalJson(value);
  return Array.isArray(parsedValue)
    ? parsedValue.filter((item): item is string => typeof item === 'string')
    : undefined;
};

const buildScheduleTriggerConfig = (
  scheduleModeDraft: 'manual' | 'interval' | 'cron',
  scheduleIntervalSecondsDraft: string,
  scheduleCronDraft: string
): IScheduleTriggerConfig => {
  const nextScheduleConfig: IScheduleTriggerConfig = { mode: scheduleModeDraft };

  if (scheduleModeDraft === 'interval') {
    const intervalSeconds = Number(scheduleIntervalSecondsDraft);
    if (!Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
      throw new Error('invalid schedule interval');
    }
    nextScheduleConfig.intervalSeconds = intervalSeconds;
  }

  if (scheduleModeDraft === 'cron') {
    const cron = scheduleCronDraft.trim();
    if (!cron) {
      throw new Error('invalid schedule cron');
    }
    nextScheduleConfig.cron = cron;
  }

  return nextScheduleConfig;
};

const buildWebhookTriggerConfig = ({
  webhookSecretDraft,
  webhookSignatureSecretDraft,
  webhookBodyLimitDraft,
  webhookTimestampToleranceDraft,
  fieldMappings,
  activationInput,
  activationChecks,
}: {
  webhookSecretDraft: string;
  webhookSignatureSecretDraft: string;
  webhookBodyLimitDraft: string;
  webhookTimestampToleranceDraft: string;
  fieldMappings?: Record<string, string>;
  activationInput?: Record<string, unknown>;
  activationChecks?: string[];
}) => ({
  ...(webhookSecretDraft.trim() && { secret: webhookSecretDraft.trim() }),
  ...(webhookSignatureSecretDraft.trim() && {
    signatureSecret: webhookSignatureSecretDraft.trim(),
  }),
  ...(Number(webhookBodyLimitDraft) > 0 && {
    bodySizeLimitKb: Number(webhookBodyLimitDraft),
  }),
  ...(Number(webhookTimestampToleranceDraft) > 0 && {
    timestampToleranceSeconds: Number(webhookTimestampToleranceDraft),
  }),
  ...(fieldMappings && Object.keys(fieldMappings).length && { fieldMappings }),
  ...((activationInput || activationChecks?.length) && {
    testPlan: {
      ...(activationInput && { input: activationInput }),
      ...(activationChecks?.length && { activationChecks }),
    },
  }),
});

const buildUpdatedTriggerNodes = ({
  workflow,
  recordTriggerKindDraft,
  recordTriggerTableIdDraft,
  recordTriggerFilterDraft,
  webhookSecretDraft,
  webhookSignatureSecretDraft,
  webhookBodyLimitDraft,
  webhookTimestampToleranceDraft,
  fieldMappingsDraft,
  activationTestInputDraft,
  activationChecksDraft,
  scheduleModeDraft,
  scheduleIntervalSecondsDraft,
  scheduleCronDraft,
}: {
  workflow: IWorkflowDetailVo;
  recordTriggerKindDraft: WorkflowRecordTriggerKind;
  recordTriggerTableIdDraft: string;
  recordTriggerFilterDraft: string;
  webhookSecretDraft: string;
  webhookSignatureSecretDraft: string;
  webhookBodyLimitDraft: string;
  webhookTimestampToleranceDraft: string;
  fieldMappingsDraft: string;
  activationTestInputDraft: string;
  activationChecksDraft: string;
  scheduleModeDraft: 'manual' | 'interval' | 'cron';
  scheduleIntervalSecondsDraft: string;
  scheduleCronDraft: string;
}) => {
  const tableId = recordTriggerTableIdDraft.trim();
  const filter = parseUnknownRecord(recordTriggerFilterDraft);
  const fieldMappings = parseStringRecordMap(fieldMappingsDraft);
  const activationInput = parseUnknownRecord(activationTestInputDraft);
  const activationChecks = parseStringArray(activationChecksDraft);

  return workflow.nodes.map((node) => {
    if (node.nodeType !== 'trigger') {
      return node;
    }

    if (['recordCreated', 'recordUpdated', 'recordMatchesConditions'].includes(node.kind)) {
      const config = (node.config ?? {}) as Record<string, unknown>;
      const { tableId: _tableId, filter: _filter, ...restConfig } = config;
      return {
        ...node,
        kind: recordTriggerKindDraft,
        config: {
          ...restConfig,
          ...(tableId && { tableId }),
          ...(filter && { filter }),
        },
      };
    }

    if (node.kind === 'webhook') {
      return {
        ...node,
        config: buildWebhookTriggerConfig({
          webhookSecretDraft,
          webhookSignatureSecretDraft,
          webhookBodyLimitDraft,
          webhookTimestampToleranceDraft,
          fieldMappings,
          activationInput,
          activationChecks,
        }),
      };
    }

    if (node.kind !== 'schedule') {
      return node;
    }

    return {
      ...node,
      config: buildScheduleTriggerConfig(
        scheduleModeDraft,
        scheduleIntervalSecondsDraft,
        scheduleCronDraft
      ),
    };
  });
};

interface IWorkflowSidebarProps {
  workflows: IWorkflowVo[];
  selectedId?: string;
  draftPrompt: string;
  recordTriggerTableId: string;
  isCreatingDraft: boolean;
  isCreatingRecordTrigger: boolean;
  isCreatingEmailTrigger: boolean;
  isCreatingFormTrigger: boolean;
  isCreatingScheduleTrigger: boolean;
  isCreatingWebhookTrigger: boolean;
  onDraftPromptChange: (value: string) => void;
  onCreateDraft: () => void;
  onRecordTriggerTableIdChange: (value: string) => void;
  onCreateRecordTrigger: (
    triggerType: WorkflowRecordTriggerKind,
    actionKind?: 'runScript' | 'aiGenerate'
  ) => void;
  onCreateEmailTrigger: () => void;
  onCreateFormTrigger: () => void;
  onCreateScheduleTrigger: () => void;
  onCreateWebhookTrigger: () => void;
  onSelectWorkflow: (workflow: IWorkflowVo) => void;
}

const WorkflowSidebar = (props: IWorkflowSidebarProps) => {
  const {
    workflows,
    selectedId,
    draftPrompt,
    recordTriggerTableId,
    isCreatingDraft,
    isCreatingRecordTrigger,
    isCreatingEmailTrigger,
    isCreatingFormTrigger,
    isCreatingScheduleTrigger,
    isCreatingWebhookTrigger,
    onDraftPromptChange,
    onCreateDraft,
    onRecordTriggerTableIdChange,
    onCreateRecordTrigger,
    onCreateEmailTrigger,
    onCreateFormTrigger,
    onCreateScheduleTrigger,
    onCreateWebhookTrigger,
    onSelectWorkflow,
  } = props;

  return (
    <Card className="min-h-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Workflows</CardTitle>
      </CardHeader>
      <CardContent className="flex h-[calc(100%-72px)] flex-col gap-3">
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="text-sm font-medium">Create with AI</div>
          <Textarea
            value={draftPrompt}
            onChange={(event) => onDraftPromptChange(event.target.value)}
            className="min-h-24 resize-none text-xs"
          />
          <Button
            size="sm"
            className="w-full"
            disabled={!draftPrompt.trim() || isCreatingDraft}
            onClick={onCreateDraft}
          >
            Create inactive draft
          </Button>
        </div>

        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="text-sm font-medium">Create record trigger</div>
          <Input
            value={recordTriggerTableId}
            onChange={(event) => onRecordTriggerTableIdChange(event.target.value)}
            placeholder="Optional table id"
            className="text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isCreatingRecordTrigger}
              onClick={() => onCreateRecordTrigger('recordCreated')}
            >
              On create
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isCreatingRecordTrigger}
              onClick={() => onCreateRecordTrigger('recordUpdated')}
            >
              On update
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isCreatingRecordTrigger}
            onClick={() => onCreateRecordTrigger('recordMatchesConditions')}
          >
            On match conditions
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isCreatingRecordTrigger}
            onClick={() => onCreateRecordTrigger('recordCreated', 'aiGenerate')}
          >
            AI summarize on create
          </Button>
          <p className="text-xs text-muted-foreground">
            Leave table id empty to listen to all tables in this base.
          </p>
        </div>

        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="text-sm font-medium">Create email trigger</div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isCreatingEmailTrigger}
            onClick={onCreateEmailTrigger}
          >
            Create email received draft
          </Button>
          <p className="text-xs text-muted-foreground">
            Creates an inactive email-received workflow draft with a Run Script action.
          </p>
        </div>

        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="text-sm font-medium">Create form trigger</div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isCreatingFormTrigger}
            onClick={onCreateFormTrigger}
          >
            Create form submitted draft
          </Button>
          <p className="text-xs text-muted-foreground">
            Creates an inactive form-submitted workflow draft with a Run Script action.
          </p>
        </div>

        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="text-sm font-medium">Create schedule trigger</div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isCreatingScheduleTrigger}
            onClick={onCreateScheduleTrigger}
          >
            Create schedule draft
          </Button>
          <p className="text-xs text-muted-foreground">
            Creates an inactive schedule workflow draft with a Run Script action.
          </p>
        </div>

        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="text-sm font-medium">Create webhook trigger</div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={isCreatingWebhookTrigger}
            onClick={onCreateWebhookTrigger}
          >
            Create webhook draft
          </Button>
          <p className="text-xs text-muted-foreground">
            Creates an inactive webhook workflow draft with a Run Script action.
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1">
          {workflows.map((item) => (
            <button
              key={item.id}
              className={cn(
                'flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted/50',
                selectedId === item.id && 'border-primary bg-primary/5'
              )}
              onClick={() => onSelectWorkflow(item)}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{item.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {item.description || 'No description'}
                </div>
              </div>
              <Badge variant={item.isActive ? 'default' : 'outline'}>
                {item.isActive ? 'Active' : 'Draft'}
              </Badge>
            </button>
          ))}
          {!workflows.length && (
            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              No workflows yet. Create an AI draft to start.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface IWorkflowDetailProps {
  workflow?: IWorkflowDetailVo;
  nameDraft: string;
  descriptionDraft: string;
  scriptPreview: string;
  scriptDraft: string;
  selectedScriptNodeId?: string;
  aiPromptPreview: string;
  aiPromptDraft: string;
  selectedAiNodeId?: string;
  selectedRecordActionNodeId?: string;
  recordActionDraft: string;
  activeRecordActionKind?: WorkflowRecordActionKind;
  selectedGenericActionNodeId?: string;
  genericActionDraft: string;
  activeGenericActionKind?: WorkflowGenericActionKind;
  webhookSecretDraft: string;
  webhookSignatureSecretDraft: string;
  webhookBodyLimitDraft: string;
  webhookTimestampToleranceDraft: string;
  fieldMappingsDraft: string;
  activationTestInputDraft: string;
  activationChecksDraft: string;
  testRunInputDraft: string;
  runDetail?: IWorkflowRunDetailVo;
  recordTriggerTableIdPreview: string;
  recordTriggerTableIdDraft: string;
  recordTriggerKindDraft: WorkflowRecordTriggerKind;
  recordTriggerFilterDraft: string;
  scheduleModeDraft: 'manual' | 'interval' | 'cron';
  scheduleIntervalSecondsDraft: string;
  scheduleCronDraft: string;
  isActivating: boolean;
  isApplyingUpdate: boolean;
  isDeactivating: boolean;
  isDeleting: boolean;
  isTesting: boolean;
  isSavingMetadata: boolean;
  isSavingScript: boolean;
  isSavingAiPrompt: boolean;
  isSavingRecordAction: boolean;
  isSavingGenericAction: boolean;
  isSavingRecordTrigger: boolean;
  isAddingAction: boolean;
  isRemovingAction: boolean;
  isTestingNode: boolean;
  actionCapabilities: IWorkflowActionCapabilityMap;
  applyUpdateDisabled?: boolean;
  applyUpdateDisabledReason?: string;
  onApplyUpdate: () => void;
  onToggleActive: () => void;
  onDelete: (workflowId: string) => void;
  onTriggerEmailReceived: (workflowId: string) => void;
  onTestRun: (workflowId: string) => void;
  onTriggerFormSubmitted: (workflowId: string) => void;
  onTriggerSchedule: (workflowId: string) => void;
  onTriggerWebhook: (workflowId: string) => void;
  onNameDraftChange: (value: string) => void;
  onDescriptionDraftChange: (value: string) => void;
  onTestRunInputDraftChange: (value: string) => void;
  onSaveMetadata: () => void;
  onSaveScript: () => void;
  onSaveAiPrompt: () => void;
  onSelectScriptNode: (nodeId: string) => void;
  onScriptDraftChange: (value: string) => void;
  onSelectAiNode: (nodeId: string) => void;
  onAiPromptDraftChange: (value: string) => void;
  onRecordTriggerKindDraftChange: (value: WorkflowRecordTriggerKind) => void;
  onSelectRecordActionNode: (nodeId: string) => void;
  onSelectGenericActionNode: (nodeId: string) => void;
  onRecordActionDraftChange: (value: string) => void;
  onGenericActionDraftChange: (value: string) => void;
  onRecordTriggerTableIdDraftChange: (value: string) => void;
  onRecordTriggerFilterDraftChange: (value: string) => void;
  onWebhookSecretDraftChange: (value: string) => void;
  onWebhookSignatureSecretDraftChange: (value: string) => void;
  onWebhookBodyLimitDraftChange: (value: string) => void;
  onWebhookTimestampToleranceDraftChange: (value: string) => void;
  onFieldMappingsDraftChange: (value: string) => void;
  onActivationTestInputDraftChange: (value: string) => void;
  onActivationChecksDraftChange: (value: string) => void;
  onScheduleModeDraftChange: (value: 'manual' | 'interval' | 'cron') => void;
  onScheduleIntervalSecondsDraftChange: (value: string) => void;
  onScheduleCronDraftChange: (value: string) => void;
  onSaveRecordAction: () => void;
  onSaveGenericAction: () => void;
  onSaveRecordTrigger: () => void;
  onAddAction: (kind: WorkflowActionKind) => void;
  onRemoveAction: (nodeId: string) => void;
  onTestNode: (nodeId: string) => void;
}

interface IWorkflowNodeCardProps {
  node: IWorkflowNode;
  selectedScriptNodeId?: string;
  selectedAiNodeId?: string;
  selectedRecordActionNodeId?: string;
  selectedGenericActionNodeId?: string;
  isRemovingAction: boolean;
  isTestingNode: boolean;
  onSelectScriptNode: (nodeId: string) => void;
  onSelectAiNode: (nodeId: string) => void;
  onSelectRecordActionNode: (nodeId: string) => void;
  onSelectGenericActionNode: (nodeId: string) => void;
  onRemoveAction: (nodeId: string) => void;
  onTestNode: (nodeId: string) => void;
}

const WorkflowNodeCard = (props: IWorkflowNodeCardProps) => {
  const {
    node,
    selectedScriptNodeId,
    selectedAiNodeId,
    selectedRecordActionNodeId,
    selectedGenericActionNodeId,
    isRemovingAction,
    isTestingNode,
    onSelectScriptNode,
    onSelectAiNode,
    onSelectRecordActionNode,
    onSelectGenericActionNode,
    onRemoveAction,
    onTestNode,
  } = props;
  const isAction = node.nodeType === 'action';
  const isRunScript = isAction && node.kind === 'runScript';
  const isAiGenerate = isAction && node.kind === 'aiGenerate';
  const isUpdateRecords = isAction && node.kind === 'updateRecords';
  const isCreateRecords = isAction && node.kind === 'createRecords';
  const isQueryRecords = isAction && node.kind === 'queryRecords';
  const isGenericAction = isAction && ['sendEmail', 'httpRequest', 'condition'].includes(node.kind);

  return (
    <div className="rounded-lg border p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium">{node.kind}</div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{node.nodeType}</Badge>
          {isAction && (
            <Button
              size="sm"
              variant="outline"
              disabled={isTestingNode}
              onClick={() => onTestNode(node.id)}
            >
              Test node
            </Button>
          )}
          {isAction && (
            <Button
              size="sm"
              variant="ghost"
              disabled={isRemovingAction}
              onClick={() => onRemoveAction(node.id)}
            >
              Remove
            </Button>
          )}
        </div>
      </div>
      <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
        <div>id: {node.id}</div>
        <div>next: {node.nextNodeId ?? 'none'}</div>
      </div>
      {(node.testStatus || node.testOutput != null) && (
        <div className="mt-3 space-y-2 rounded-md border bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-medium text-foreground">Node debug state</span>
            {node.testStatus && <Badge variant="outline">{node.testStatus}</Badge>}
          </div>
          {node.testOutput != null && (
            <pre className="max-h-40 overflow-auto rounded border bg-background p-2 text-xs">
              {formatJson(node.testOutput)}
            </pre>
          )}
        </div>
      )}
      {isRunScript && (
        <Button
          size="sm"
          variant={selectedScriptNodeId === node.id ? 'default' : 'outline'}
          className="mt-3"
          onClick={() => onSelectScriptNode(node.id)}
        >
          Edit script
        </Button>
      )}
      {isAiGenerate && (
        <Button
          size="sm"
          variant={selectedAiNodeId === node.id ? 'default' : 'outline'}
          className="mt-3"
          onClick={() => onSelectAiNode(node.id)}
        >
          Edit prompt
        </Button>
      )}
      {isUpdateRecords && (
        <Button
          size="sm"
          variant={selectedRecordActionNodeId === node.id ? 'default' : 'outline'}
          className="mt-3"
          onClick={() => onSelectRecordActionNode(node.id)}
        >
          Edit record update
        </Button>
      )}
      {isCreateRecords && (
        <Button
          size="sm"
          variant={selectedRecordActionNodeId === node.id ? 'default' : 'outline'}
          className="mt-3"
          onClick={() => onSelectRecordActionNode(node.id)}
        >
          Edit record create
        </Button>
      )}
      {isQueryRecords && (
        <Button
          size="sm"
          variant={selectedRecordActionNodeId === node.id ? 'default' : 'outline'}
          className="mt-3"
          onClick={() => onSelectRecordActionNode(node.id)}
        >
          Edit record query
        </Button>
      )}
      {isGenericAction && (
        <Button
          size="sm"
          variant={selectedGenericActionNodeId === node.id ? 'default' : 'outline'}
          className="mt-3"
          onClick={() => onSelectGenericActionNode(node.id)}
        >
          Edit generic action
        </Button>
      )}
    </div>
  );
};

interface IWorkflowDetailHeaderProps {
  workflow?: IWorkflowDetailVo;
  isActivating: boolean;
  isApplyingUpdate: boolean;
  isDeactivating: boolean;
  isDeleting: boolean;
  isTesting: boolean;
  activateDisabled?: boolean;
  activateDisabledReason?: string;
  applyUpdateDisabled?: boolean;
  applyUpdateDisabledReason?: string;
  testRunDisabled?: boolean;
  testRunDisabledReason?: string;
  onApplyUpdate: () => void;
  onToggleActive: () => void;
  onDelete: (workflowId: string) => void;
  onTestRun: (workflowId: string) => void;
}

const WorkflowDetailHeader = (props: IWorkflowDetailHeaderProps) => {
  const {
    workflow,
    isActivating,
    isApplyingUpdate,
    isDeactivating,
    isDeleting,
    isTesting,
    activateDisabled,
    activateDisabledReason,
    applyUpdateDisabled,
    applyUpdateDisabledReason,
    testRunDisabled,
    testRunDisabledReason,
  } = props;

  return (
    <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
      <div>
        <CardTitle className="text-base">{workflow?.name ?? 'Workflow detail'}</CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          {workflow?.description ??
            'Select a workflow to inspect trigger, script, and activation state.'}
        </p>
      </div>
      {workflow && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isApplyingUpdate || applyUpdateDisabled}
            title={applyUpdateDisabledReason}
            onClick={props.onApplyUpdate}
          >
            Apply update
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isTesting || testRunDisabled}
            title={testRunDisabledReason}
            onClick={() => props.onTestRun(workflow.id)}
          >
            Test run
          </Button>
          <Button
            size="sm"
            variant={workflow.isActive ? 'outline' : 'default'}
            disabled={isActivating || isDeactivating || (!workflow.isActive && activateDisabled)}
            title={!workflow.isActive ? activateDisabledReason : undefined}
            onClick={props.onToggleActive}
          >
            {workflow.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isDeleting}
            onClick={() => props.onDelete(workflow.id)}
          >
            Delete
          </Button>
        </div>
      )}
    </CardHeader>
  );
};

const getWorkflowDetailCapabilities = (
  workflow: IWorkflowDetailVo | undefined,
  previews: {
    script: string;
    aiPrompt: string;
    recordTriggerTableId: string;
    recordTriggerFilter: string;
  }
) => ({
  hasRunScript: Boolean(
    previews.script || workflow?.nodes.some((node) => node.kind === 'runScript')
  ),
  hasAiGenerate: Boolean(
    previews.aiPrompt || workflow?.nodes.some((node) => node.kind === 'aiGenerate')
  ),
  hasRecordTrigger: Boolean(
    previews.recordTriggerTableId ||
      previews.recordTriggerFilter ||
      workflow?.nodes.some(
        (node) =>
          node.nodeType === 'trigger' &&
          ['recordCreated', 'recordUpdated', 'recordMatchesConditions'].includes(node.kind)
      )
  ),
});

const getWorkflowRunAvailability = (
  workflow: IWorkflowDetailVo | undefined,
  actionCapabilities: IWorkflowActionCapabilityMap
) => {
  const unrunnableAction = workflow?.nodes.find(
    (node) => node.nodeType === 'action' && actionCapabilities[node.kind]?.runnable === false
  );
  const reason = unrunnableAction ? actionCapabilities[unrunnableAction.kind]?.reason : undefined;

  return {
    disabled: Boolean(unrunnableAction),
    reason: unrunnableAction
      ? `Action ${unrunnableAction.kind} is not runnable yet${reason ? `: ${reason}` : ''}`
      : undefined,
  };
};

const getRecordActionConfigText = (workflow?: IWorkflowDetailVo, nodeId?: string) => {
  const recordActionNode = workflow?.nodes.find(
    (node) =>
      node.nodeType === 'action' &&
      ['updateRecords', 'createRecords', 'queryRecords'].includes(node.kind) &&
      (!nodeId || node.id === nodeId)
  );
  return recordActionNode?.config ? JSON.stringify(recordActionNode.config, null, 2) : '';
};

const getRecordActionKind = (
  workflow: IWorkflowDetailVo | undefined,
  nodeId: string | undefined
): WorkflowRecordActionKind | undefined => {
  const kind = workflow?.nodes.find((node) => node.id === nodeId)?.kind;
  if (kind === 'updateRecords' || kind === 'createRecords' || kind === 'queryRecords') {
    return kind;
  }
  return undefined;
};

// eslint-disable-next-line sonarjs/cognitive-complexity
const WorkflowDetail = (props: IWorkflowDetailProps) => {
  const {
    workflow,
    nameDraft,
    descriptionDraft,
    scriptPreview,
    scriptDraft,
    selectedScriptNodeId,
    aiPromptPreview,
    aiPromptDraft,
    selectedAiNodeId,
    selectedRecordActionNodeId,
    recordActionDraft,
    activeRecordActionKind,
    selectedGenericActionNodeId,
    genericActionDraft,
    activeGenericActionKind,
    webhookSecretDraft,
    webhookSignatureSecretDraft,
    webhookBodyLimitDraft,
    webhookTimestampToleranceDraft,
    fieldMappingsDraft,
    activationTestInputDraft,
    activationChecksDraft,
    testRunInputDraft,
    runDetail,
    recordTriggerTableIdPreview,
    recordTriggerTableIdDraft,
    recordTriggerKindDraft,
    recordTriggerFilterDraft,
    scheduleModeDraft,
    scheduleIntervalSecondsDraft,
    scheduleCronDraft,
    isActivating,
    isApplyingUpdate,
    isDeactivating,
    isDeleting,
    isTesting,
    isSavingMetadata,
    isSavingScript,
    isSavingAiPrompt,
    isSavingRecordAction,
    isSavingGenericAction,
    isSavingRecordTrigger,
    isAddingAction,
    isRemovingAction,
    isTestingNode,
    actionCapabilities,
    applyUpdateDisabled,
    applyUpdateDisabledReason,
    onApplyUpdate,
    onToggleActive,
    onDelete,
    onTriggerEmailReceived,
    onTestRun,
    onTriggerFormSubmitted,
    onTriggerSchedule,
    onTriggerWebhook,
    onNameDraftChange,
    onDescriptionDraftChange,
    onTestRunInputDraftChange,
    onSaveMetadata,
    onSelectScriptNode,
    onScriptDraftChange,
    onSaveScript,
    onSelectAiNode,
    onAiPromptDraftChange,
    onSelectRecordActionNode,
    onSelectGenericActionNode,
    onRecordActionDraftChange,
    onGenericActionDraftChange,
    onSaveAiPrompt,
    onRecordTriggerKindDraftChange,
    onRecordTriggerTableIdDraftChange,
    onRecordTriggerFilterDraftChange,
    onWebhookSecretDraftChange,
    onWebhookSignatureSecretDraftChange,
    onWebhookBodyLimitDraftChange,
    onWebhookTimestampToleranceDraftChange,
    onFieldMappingsDraftChange,
    onActivationTestInputDraftChange,
    onActivationChecksDraftChange,
    onScheduleModeDraftChange,
    onScheduleIntervalSecondsDraftChange,
    onScheduleCronDraftChange,
    onSaveRecordAction,
    onSaveGenericAction,
    onSaveRecordTrigger,
    onAddAction,
    onRemoveAction,
    onTestNode,
  } = props;
  const { hasRunScript, hasAiGenerate, hasRecordTrigger } = getWorkflowDetailCapabilities(
    workflow,
    {
      script: scriptPreview,
      aiPrompt: aiPromptPreview,
      recordTriggerTableId: recordTriggerTableIdPreview,
      recordTriggerFilter: recordTriggerFilterDraft,
    }
  );
  const workflowRunAvailability = getWorkflowRunAvailability(workflow, actionCapabilities);
  const parsedRecordActionDraft = parseRecordActionDraft(recordActionDraft, activeRecordActionKind);
  const parsedRecordUpdateDraft =
    activeRecordActionKind === 'updateRecords' && parsedRecordActionDraft
      ? (parsedRecordActionDraft as IRecordUpdateActionConfig)
      : undefined;
  const parsedRecordCreateDraft =
    activeRecordActionKind === 'createRecords' && parsedRecordActionDraft
      ? (parsedRecordActionDraft as IRecordCreateActionConfig)
      : undefined;
  const parsedRecordQueryDraft =
    activeRecordActionKind === 'queryRecords' && parsedRecordActionDraft
      ? (parsedRecordActionDraft as IRecordQueryActionConfig)
      : undefined;
  const webhookNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && node.kind === 'webhook'
  );
  const scheduleNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && node.kind === 'schedule'
  );
  const emailReceivedNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && node.kind === 'emailReceived'
  );
  const formSubmittedNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && node.kind === 'formSubmitted'
  );
  const webhookUrl = workflow?.id
    ? `/api/base/${workflow.baseId}/workflow/${workflow.id}/webhook`
    : '';
  const selectedNodeDebugRunStep =
    runDetail?.steps.find(
      (step: IWorkflowRunDetailVo['steps'][number]) => step.nodeId === selectedScriptNodeId
    ) ??
    runDetail?.steps.find(
      (step: IWorkflowRunDetailVo['steps'][number]) => step.nodeId === selectedAiNodeId
    ) ??
    runDetail?.steps.find(
      (step: IWorkflowRunDetailVo['steps'][number]) => step.nodeId === selectedRecordActionNodeId
    );

  return (
    <Card className="min-h-0 overflow-hidden">
      <WorkflowDetailHeader
        workflow={workflow}
        isActivating={isActivating}
        isApplyingUpdate={isApplyingUpdate}
        isDeactivating={isDeactivating}
        isDeleting={isDeleting}
        isTesting={isTesting}
        activateDisabled={workflowRunAvailability.disabled}
        activateDisabledReason={workflowRunAvailability.reason}
        applyUpdateDisabled={applyUpdateDisabled}
        applyUpdateDisabledReason={applyUpdateDisabledReason}
        testRunDisabled={workflowRunAvailability.disabled}
        testRunDisabledReason={workflowRunAvailability.reason}
        onApplyUpdate={onApplyUpdate}
        onToggleActive={onToggleActive}
        onDelete={onDelete}
        onTestRun={onTestRun}
      />
      <CardContent className="space-y-4 overflow-auto">
        {workflow ? (
          <>
            {selectedNodeDebugRunStep && (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Latest selected node run</div>
                  <Badge variant="outline">{selectedNodeDebugRunStep.status}</Badge>
                </div>
                <pre className="max-h-40 overflow-auto rounded border bg-background p-2 text-xs">
                  {formatJson(selectedNodeDebugRunStep.output)}
                </pre>
              </div>
            )}
            {webhookNode && (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Webhook endpoint</div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isTesting}
                    onClick={() => onTriggerWebhook(workflow.id)}
                  >
                    Trigger webhook
                  </Button>
                </div>
                <pre className="overflow-auto rounded border bg-background p-2 text-xs">
                  {webhookUrl}
                </pre>
                <Input
                  value={webhookSecretDraft}
                  onChange={(event) => onWebhookSecretDraftChange(event.target.value)}
                  placeholder="optional webhook secret"
                  className="text-xs"
                />
                <Input
                  value={webhookSignatureSecretDraft}
                  onChange={(event) => onWebhookSignatureSecretDraftChange(event.target.value)}
                  placeholder="optional webhook signature secret"
                  className="text-xs"
                />
                <Input
                  value={webhookBodyLimitDraft}
                  onChange={(event) => onWebhookBodyLimitDraftChange(event.target.value)}
                  placeholder="webhook body limit KB"
                  className="text-xs"
                />
                <Input
                  value={webhookTimestampToleranceDraft}
                  onChange={(event) => onWebhookTimestampToleranceDraftChange(event.target.value)}
                  placeholder="webhook timestamp tolerance seconds"
                  className="text-xs"
                />
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    fieldMappings JSON
                  </div>
                  <Textarea
                    value={fieldMappingsDraft}
                    onChange={(event) => onFieldMappingsDraftChange(event.target.value)}
                    className="min-h-24 resize-none font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    activation test input JSON
                  </div>
                  <Textarea
                    value={activationTestInputDraft}
                    onChange={(event) => onActivationTestInputDraftChange(event.target.value)}
                    className="min-h-24 resize-none font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium text-muted-foreground">
                    activation checks JSON
                  </div>
                  <Textarea
                    value={activationChecksDraft}
                    onChange={(event) => onActivationChecksDraftChange(event.target.value)}
                    className="min-h-20 resize-none font-mono text-xs"
                  />
                </div>
                <div className="rounded border bg-background p-2 text-xs text-muted-foreground">
                  Signing contract: `sha256=HEX(HMAC_SHA256(secret, timestamp.rawBody))`, headers
                  use `x-webhook-signature` and `x-webhook-timestamp`.
                </div>
                <p className="text-xs text-muted-foreground">
                  Use this endpoint to trigger the active webhook workflow. The test input below can
                  also be sent through the in-app trigger button.
                </p>
              </div>
            )}
            {scheduleNode && (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Schedule trigger</div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isTesting}
                    onClick={() => onTriggerSchedule(workflow.id)}
                  >
                    Trigger schedule
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Save `manual`, `interval`, or `cron` mode here. Active workflows sync backend
                  schedule jobs automatically.
                </p>
                <Select value={scheduleModeDraft} onValueChange={onScheduleModeDraftChange}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="interval">Interval</SelectItem>
                    <SelectItem value="cron">Cron</SelectItem>
                  </SelectContent>
                </Select>
                {scheduleModeDraft === 'interval' && (
                  <Input
                    value={scheduleIntervalSecondsDraft}
                    onChange={(event) => onScheduleIntervalSecondsDraftChange(event.target.value)}
                    placeholder="interval seconds"
                    className="text-xs"
                  />
                )}
                {scheduleModeDraft === 'cron' && (
                  <Input
                    value={scheduleCronDraft}
                    onChange={(event) => onScheduleCronDraftChange(event.target.value)}
                    placeholder="*/5 * * * *"
                    className="text-xs"
                  />
                )}
                <Button size="sm" variant="outline" onClick={onSaveRecordTrigger}>
                  Save trigger
                </Button>
              </div>
            )}
            {emailReceivedNode && (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Email received trigger</div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isTesting}
                    onClick={() => onTriggerEmailReceived(workflow.id)}
                  >
                    Trigger email receive
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is a manual email-received trigger entry for the current draft/runtime path.
                </p>
              </div>
            )}
            {formSubmittedNode && (
              <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">Form submitted trigger</div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isTesting}
                    onClick={() => onTriggerFormSubmitted(workflow.id)}
                  >
                    Trigger form submit
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This is a manual form-submitted trigger entry for the current draft/runtime path.
                </p>
              </div>
            )}
            <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
              <div className="text-sm font-medium">Test run input</div>
              <Textarea
                value={testRunInputDraft}
                onChange={(event) => onTestRunInputDraftChange(event.target.value)}
                className="min-h-28 resize-none font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                The Test run button sends this JSON as workflow input. Leave the default object to
                use workspace metadata only.
              </p>
            </div>
            <div className="space-y-2 rounded-lg border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Workflow metadata</div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!nameDraft.trim() || isSavingMetadata}
                  onClick={onSaveMetadata}
                >
                  Save metadata
                </Button>
              </div>
              <Input
                value={nameDraft}
                onChange={(event) => onNameDraftChange(event.target.value)}
                placeholder="Workflow name"
                className="text-xs"
              />
              <Textarea
                value={descriptionDraft}
                onChange={(event) => onDescriptionDraftChange(event.target.value)}
                placeholder="Optional description"
                className="min-h-20 resize-none text-xs"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Status</div>
                <div className="mt-1 font-medium">{workflow.isActive ? 'Active' : 'Draft'}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Nodes</div>
                <div className="mt-1 font-medium">{workflow.nodes.length}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Snapshot</div>
                <div className="mt-1 truncate font-medium">
                  {workflow.activeSnapshotId ?? 'None'}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Nodes</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isAddingAction || !actionCapabilities.runScript?.configurable}
                  title={actionCapabilities.runScript?.reason}
                  onClick={() => onAddAction('runScript')}
                >
                  Add Run Script
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isAddingAction || !actionCapabilities.aiGenerate?.configurable}
                  title={actionCapabilities.aiGenerate?.reason}
                  onClick={() => onAddAction('aiGenerate')}
                >
                  Add AI Generate
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isAddingAction || !actionCapabilities.updateRecords?.configurable}
                  title={actionCapabilities.updateRecords?.reason}
                  onClick={() => onAddAction('updateRecords')}
                >
                  Add Record Update
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isAddingAction || !actionCapabilities.createRecords?.configurable}
                  title={actionCapabilities.createRecords?.reason}
                  onClick={() => onAddAction('createRecords')}
                >
                  Add Record Create
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isAddingAction || !actionCapabilities.queryRecords?.configurable}
                  title={actionCapabilities.queryRecords?.reason}
                  onClick={() => onAddAction('queryRecords')}
                >
                  Add Record Query
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isAddingAction || !actionCapabilities.sendEmail?.configurable}
                  title={actionCapabilities.sendEmail?.reason}
                  onClick={() => onAddAction('sendEmail')}
                >
                  Add Send Email
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isAddingAction || !actionCapabilities.httpRequest?.configurable}
                  title={actionCapabilities.httpRequest?.reason}
                  onClick={() => onAddAction('httpRequest')}
                >
                  Add HTTP Request
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isAddingAction || !actionCapabilities.condition?.configurable}
                  title={actionCapabilities.condition?.reason}
                  onClick={() => onAddAction('condition')}
                >
                  Add Condition
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isAddingAction || !actionCapabilities.loop?.configurable}
                  title={actionCapabilities.loop?.reason}
                  onClick={() => onAddAction('loop')}
                >
                  Add Loop
                </Button>
              </div>
              {workflow.nodes.map((node) => (
                <WorkflowNodeCard
                  key={node.id}
                  node={node}
                  selectedScriptNodeId={selectedScriptNodeId}
                  selectedAiNodeId={selectedAiNodeId}
                  selectedRecordActionNodeId={selectedRecordActionNodeId}
                  selectedGenericActionNodeId={selectedGenericActionNodeId}
                  isRemovingAction={isRemovingAction}
                  isTestingNode={isTestingNode}
                  onSelectScriptNode={onSelectScriptNode}
                  onSelectAiNode={onSelectAiNode}
                  onSelectRecordActionNode={onSelectRecordActionNode}
                  onSelectGenericActionNode={onSelectGenericActionNode}
                  onRemoveAction={onRemoveAction}
                  onTestNode={onTestNode}
                />
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">Record trigger scope</div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasRecordTrigger || isSavingRecordTrigger}
                  onClick={onSaveRecordTrigger}
                >
                  Save trigger
                </Button>
              </div>
              <Input
                value={
                  hasRecordTrigger ? recordTriggerTableIdDraft : 'No record trigger configured.'
                }
                disabled={!hasRecordTrigger}
                onChange={(event) => onRecordTriggerTableIdDraftChange(event.target.value)}
                placeholder="Optional table id"
                className="text-xs"
              />
              <Select
                value={recordTriggerKindDraft}
                disabled={!hasRecordTrigger}
                onValueChange={(value) =>
                  onRecordTriggerKindDraftChange(value as WorkflowRecordTriggerKind)
                }
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recordCreated">When record is created</SelectItem>
                  <SelectItem value="recordUpdated">When record is updated</SelectItem>
                  <SelectItem value="recordMatchesConditions">
                    When record matches conditions
                  </SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                value={
                  hasRecordTrigger ? recordTriggerFilterDraft : 'No record trigger configured.'
                }
                disabled={!hasRecordTrigger}
                onChange={(event) => onRecordTriggerFilterDraftChange(event.target.value)}
                placeholder='Optional filter JSON, for example {"conjunction":"and","filterSet":[]}'
                className="min-h-28 resize-none font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                Leave table id empty to listen to all tables in this base. Leave filter empty to run
                on every matching record event.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">
                  Run Script draft{selectedScriptNodeId ? `: ${selectedScriptNodeId}` : ''}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasRunScript || isSavingScript}
                  onClick={onSaveScript}
                >
                  Save script
                </Button>
              </div>
              <Textarea
                value={hasRunScript ? scriptDraft : 'No runScript action configured.'}
                disabled={!hasRunScript}
                onChange={(event) => onScriptDraftChange(event.target.value)}
                className="min-h-80 resize-none font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">
                  Record action config
                  {selectedRecordActionNodeId ? `: ${selectedRecordActionNodeId}` : ''}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!activeRecordActionKind || isSavingRecordAction}
                  onClick={onSaveRecordAction}
                >
                  Save record action
                </Button>
              </div>
              {activeRecordActionKind === 'updateRecords' && parsedRecordUpdateDraft && (
                <div className="grid gap-2 rounded-lg border bg-muted/20 p-3 md:grid-cols-2">
                  <Input
                    value={parsedRecordUpdateDraft.tableId ?? ''}
                    onChange={(event) =>
                      onRecordActionDraftChange(
                        stringifyRecordActionDraft({
                          ...parsedRecordUpdateDraft,
                          tableId: event.target.value,
                        })
                      )
                    }
                    placeholder="tableId"
                    className="text-xs"
                  />
                  <Input
                    value={parsedRecordUpdateDraft.recordId ?? ''}
                    onChange={(event) =>
                      onRecordActionDraftChange(
                        stringifyRecordActionDraft({
                          ...parsedRecordUpdateDraft,
                          recordId: event.target.value,
                        })
                      )
                    }
                    placeholder="recordId"
                    className="text-xs"
                  />
                  <div className="md:col-span-2">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      fields JSON
                    </div>
                    <Textarea
                      value={JSON.stringify(parsedRecordUpdateDraft.fields ?? {}, null, 2)}
                      onChange={(event) =>
                        onRecordActionDraftChange(
                          stringifyRecordActionDraft({
                            ...parsedRecordUpdateDraft,
                            fields: tryParseJsonObject(
                              event.target.value || '{}',
                              parsedRecordUpdateDraft.fields ?? {}
                            ) as Record<string, unknown>,
                          })
                        )
                      }
                      className="min-h-28 resize-none font-mono text-xs"
                    />
                  </div>
                </div>
              )}
              {activeRecordActionKind === 'createRecords' && parsedRecordCreateDraft && (
                <div className="grid gap-2 rounded-lg border bg-muted/20 p-3">
                  <Input
                    value={parsedRecordCreateDraft.tableId ?? ''}
                    onChange={(event) =>
                      onRecordActionDraftChange(
                        stringifyRecordActionDraft({
                          ...parsedRecordCreateDraft,
                          tableId: event.target.value,
                        })
                      )
                    }
                    placeholder="tableId"
                    className="text-xs"
                  />
                  <div>
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      records JSON
                    </div>
                    <Textarea
                      value={JSON.stringify(parsedRecordCreateDraft.records ?? [], null, 2)}
                      onChange={(event) =>
                        onRecordActionDraftChange(
                          stringifyRecordActionDraft({
                            ...parsedRecordCreateDraft,
                            records: tryParseJsonObject(
                              event.target.value || '[]',
                              parsedRecordCreateDraft.records ?? []
                            ) as Record<string, unknown>[],
                          })
                        )
                      }
                      className="min-h-28 resize-none font-mono text-xs"
                    />
                  </div>
                </div>
              )}
              {activeRecordActionKind === 'queryRecords' && parsedRecordQueryDraft && (
                <div className="grid gap-2 rounded-lg border bg-muted/20 p-3 md:grid-cols-2">
                  <Input
                    value={parsedRecordQueryDraft.tableId ?? ''}
                    onChange={(event) =>
                      onRecordActionDraftChange(
                        stringifyRecordActionDraft({
                          ...parsedRecordQueryDraft,
                          tableId: event.target.value,
                        })
                      )
                    }
                    placeholder="tableId"
                    className="text-xs"
                  />
                  <Input
                    value={parsedRecordQueryDraft.take?.toString() ?? ''}
                    onChange={(event) =>
                      onRecordActionDraftChange(
                        stringifyRecordActionDraft({
                          ...parsedRecordQueryDraft,
                          take: event.target.value ? Number(event.target.value) : undefined,
                        })
                      )
                    }
                    placeholder="take"
                    className="text-xs"
                  />
                  <div className="md:col-span-2">
                    <div className="mb-1 text-xs font-medium text-muted-foreground">
                      filter JSON
                    </div>
                    <Textarea
                      value={JSON.stringify(parsedRecordQueryDraft.filter ?? {}, null, 2)}
                      onChange={(event) =>
                        onRecordActionDraftChange(
                          stringifyRecordActionDraft({
                            ...parsedRecordQueryDraft,
                            filter: tryParseJsonObject(
                              event.target.value || '{}',
                              parsedRecordQueryDraft.filter ?? {}
                            ) as Record<string, unknown>,
                          })
                        )
                      }
                      className="min-h-28 resize-none font-mono text-xs"
                    />
                  </div>
                </div>
              )}
              <Textarea
                value={
                  activeRecordActionKind
                    ? recordActionDraft
                    : 'No record action selected. Choose update/create/query record on a node card.'
                }
                disabled={!activeRecordActionKind}
                onChange={(event) => onRecordActionDraftChange(event.target.value)}
                className="min-h-56 resize-none font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground">
                The structured fields update the same JSON config used by the backend runtime.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">
                  Generic action config
                  {selectedGenericActionNodeId ? `: ${selectedGenericActionNodeId}` : ''}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!activeGenericActionKind || isSavingGenericAction}
                  onClick={onSaveGenericAction}
                >
                  Save generic action
                </Button>
              </div>
              <Textarea
                value={
                  activeGenericActionKind
                    ? genericActionDraft
                    : 'No generic action selected. Choose sendEmail/httpRequest/condition/loop on a node card.'
                }
                disabled={!activeGenericActionKind}
                onChange={(event) => onGenericActionDraftChange(event.target.value)}
                className="min-h-56 resize-none font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-medium">
                  AI Generate prompt draft{selectedAiNodeId ? `: ${selectedAiNodeId}` : ''}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasAiGenerate || isSavingAiPrompt}
                  onClick={onSaveAiPrompt}
                >
                  Save prompt
                </Button>
              </div>
              <Textarea
                value={hasAiGenerate ? aiPromptDraft : 'No aiGenerate action configured.'}
                disabled={!hasAiGenerate}
                onChange={(event) => onAiPromptDraftChange(event.target.value)}
                className="min-h-40 resize-none text-xs"
              />
            </div>
          </>
        ) : (
          <div className="flex h-80 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
            Select or create a workflow draft.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface IRunHistoryProps {
  runs: Array<{ id: string; status: string; durationMs?: number | null }>;
  selectedRunId?: string;
  runDetail?: IWorkflowRunDetailVo;
  onSelectRun: (runId: string) => void;
}

const RunHistory = ({ runs, selectedRunId, runDetail, onSelectRun }: IRunHistoryProps) => {
  return (
    <Card className="min-h-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Run history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 overflow-auto">
        {runs.map((run) => (
          <button
            key={run.id}
            className={cn(
              'w-full rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted/50',
              selectedRunId === run.id && 'border-primary bg-primary/5'
            )}
            onClick={() => onSelectRun(run.id)}
          >
            <div className="flex items-center justify-between gap-2">
              <span className={cn('font-medium', getStatusTone(run.status))}>{run.status}</span>
              <span className="text-xs text-muted-foreground">{run.durationMs ?? 0} ms</span>
            </div>
            <div className="mt-2 truncate text-xs text-muted-foreground">{run.id}</div>
          </button>
        ))}
        {!runs.length && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No runs yet. Activate a workflow and click its linked button field to run it.
          </div>
        )}
        {runDetail && (
          <div className="space-y-3 rounded-lg border bg-muted/20 p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium">Run detail</div>
              <Badge variant="outline">{runDetail.steps.length} steps</Badge>
            </div>
            <div className="grid gap-2 text-xs text-muted-foreground">
              <div>trigger: {runDetail.triggerType}</div>
              <div>snapshot: {runDetail.snapshotId ?? 'none'}</div>
              {runDetail.error != null && (
                <div className="text-destructive">error: {formatJson(runDetail.error)}</div>
              )}
            </div>
            {runDetail.steps.map((step) => (
              <div key={step.id} className="space-y-2 rounded-md border bg-background p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={cn('font-medium', getStatusTone(step.status))}>
                    {step.status}
                  </span>
                  <span className="text-xs text-muted-foreground">{step.durationMs ?? 0} ms</span>
                </div>
                <div className="truncate text-xs text-muted-foreground">node: {step.nodeId}</div>
                <div className="space-y-1">
                  <div className="text-xs font-medium">Input</div>
                  <pre className="max-h-40 overflow-auto rounded border bg-muted/40 p-2 text-xs">
                    {formatJson(step.input)}
                  </pre>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-medium">Output</div>
                  <pre className="max-h-40 overflow-auto rounded border bg-muted/40 p-2 text-xs">
                    {formatJson(step.output)}
                  </pre>
                </div>
                {step.error != null && (
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-destructive">Error</div>
                    <pre className="max-h-40 overflow-auto rounded border bg-destructive/10 p-2 text-xs text-destructive">
                      {formatJson(step.error)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// eslint-disable-next-line sonarjs/cognitive-complexity
export function AutomationPage(props: IAutomationPageProps = {}) {
  const router = useRouter();
  const routeBaseId = useBaseId();
  const baseId = useMemo(
    () => props.baseId ?? routeBaseId ?? (router.query.baseId as string | undefined) ?? '',
    [props.baseId, routeBaseId, router.query.baseId]
  );
  const selectedWorkflowId = useMemo(
    () => props.workflowId ?? (router.query.workflowId as string | undefined) ?? undefined,
    [props.workflowId, router.query.workflowId]
  );
  const { t } = useTranslation('common');
  const isReadOnlyPreview = useIsReadOnlyPreview();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedWorkflowId);
  const [selectedRunId, setSelectedRunId] = useState<string | undefined>();
  const [draftPrompt, setDraftPrompt] = useState(
    'When the button is clicked, inspect the record and return a short summary.'
  );
  const [recordTriggerTableId, setRecordTriggerTableId] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [selectedScriptNodeId, setSelectedScriptNodeId] = useState<string | undefined>();
  const [scriptDraft, setScriptDraft] = useState('');
  const [selectedAiNodeId, setSelectedAiNodeId] = useState<string | undefined>();
  const [aiPromptDraft, setAiPromptDraft] = useState('');
  const [selectedRecordActionNodeId, setSelectedRecordActionNodeId] = useState<
    string | undefined
  >();
  const [recordActionDraft, setRecordActionDraft] = useState('');
  const [selectedGenericActionNodeId, setSelectedGenericActionNodeId] = useState<
    string | undefined
  >();
  const [genericActionDraft, setGenericActionDraft] = useState('');
  const [webhookSecretDraft, setWebhookSecretDraft] = useState('');
  const [webhookSignatureSecretDraft, setWebhookSignatureSecretDraft] = useState('');
  const [webhookBodyLimitDraft, setWebhookBodyLimitDraft] = useState('256');
  const [webhookTimestampToleranceDraft, setWebhookTimestampToleranceDraft] = useState('300');
  const [fieldMappingsDraft, setFieldMappingsDraft] = useState('{}');
  const [activationTestInputDraft, setActivationTestInputDraft] = useState('{}');
  const [activationChecksDraft, setActivationChecksDraft] = useState('[]');
  const [testRunInputDraft, setTestRunInputDraft] = useState(
    JSON.stringify(
      {
        manual: true,
        source: 'workflowWorkspace',
      },
      null,
      2
    )
  );
  const [recordTriggerTableIdDraft, setRecordTriggerTableIdDraft] = useState('');
  const [recordTriggerKindDraft, setRecordTriggerKindDraft] =
    useState<WorkflowRecordTriggerKind>('recordCreated');
  const [recordTriggerFilterDraft, setRecordTriggerFilterDraft] = useState('');
  const [scheduleModeDraft, setScheduleModeDraft] = useState<'manual' | 'interval' | 'cron'>(
    'manual'
  );
  const [scheduleIntervalSecondsDraft, setScheduleIntervalSecondsDraft] = useState('60');
  const [scheduleCronDraft, setScheduleCronDraft] = useState('*/5 * * * *');

  const listKey = useMemo(() => workflowListQueryKey(baseId), [baseId]);
  const { data: workflows = [] } = useQuery({
    queryKey: listKey,
    queryFn: () => getWorkflowList(baseId).then(({ data }) => data),
    enabled: Boolean(baseId) && !isReadOnlyPreview,
  });

  const { data: workflowCapabilities } = useQuery({
    queryKey: workflowCapabilitiesQueryKey(baseId),
    queryFn: () => getWorkflowCapabilities(baseId).then(({ data }) => data),
    enabled: Boolean(baseId) && !isReadOnlyPreview,
  });

  const actionCapabilities = useMemo<IWorkflowActionCapabilityMap>(() => {
    return Object.fromEntries(
      (workflowCapabilities?.actions ?? []).map((capability) => [capability.kind, capability])
    );
  }, [workflowCapabilities?.actions]);

  useEffect(() => {
    if (selectedWorkflowId) {
      setSelectedId(selectedWorkflowId);
      return;
    }
    if (!selectedId && workflows[0]?.id) {
      setSelectedId(workflows[0].id);
    }
  }, [selectedWorkflowId, selectedId, workflows]);

  const workflowKey = selectedId ? ReactQueryKeys.workflowItem(baseId, selectedId) : undefined;
  const { data: workflow } = useQuery({
    queryKey: workflowKey ?? ['workflow-item-disabled', baseId],
    queryFn: () => getWorkflow(baseId, selectedId!).then(({ data }) => data),
    enabled: Boolean(baseId && selectedId) && !isReadOnlyPreview,
  });

  const firstScriptNodeId = getFirstActionNodeId(workflow, 'runScript');
  const firstAiNodeId = getFirstActionNodeId(workflow, 'aiGenerate');
  const firstRecordActionNodeId =
    getFirstActionNodeId(workflow, 'updateRecords') ??
    getFirstActionNodeId(workflow, 'createRecords') ??
    getFirstActionNodeId(workflow, 'queryRecords');
  const firstGenericActionNodeId =
    getFirstActionNodeId(workflow, 'sendEmail') ??
    getFirstActionNodeId(workflow, 'httpRequest') ??
    getFirstActionNodeId(workflow, 'condition') ??
    getFirstActionNodeId(workflow, 'loop');
  const activeScriptNodeId = getActiveActionNodeId(workflow, selectedScriptNodeId, 'runScript');
  const activeAiNodeId = getActiveActionNodeId(workflow, selectedAiNodeId, 'aiGenerate');
  const scriptPreview = getScriptPreview(workflow, activeScriptNodeId);
  const aiPromptPreview = getAiGeneratePrompt(workflow, activeAiNodeId);
  const activeRecordActionKind = getRecordActionKind(workflow, selectedRecordActionNodeId);
  const recordActionPreview = getRecordActionConfigText(workflow, selectedRecordActionNodeId);
  const activeGenericActionNode = workflow?.nodes.find(
    (node) =>
      node.id === selectedGenericActionNodeId &&
      ['sendEmail', 'httpRequest', 'condition', 'loop'].includes(node.kind)
  );
  const activeGenericActionKind = activeGenericActionNode?.kind as
    | WorkflowGenericActionKind
    | undefined;
  const genericActionPreview = activeGenericActionNode
    ? stringifyGenericActionDraft(activeGenericActionNode.config ?? {})
    : '';
  const recordTriggerTableIdPreview = getRecordTriggerTableId(workflow);
  const recordTriggerKindPreview = getRecordTriggerKind(workflow);
  const recordTriggerFilterPreview = getRecordTriggerFilterText(workflow);
  const scheduleNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && node.kind === 'schedule'
  );
  const scheduleConfig = (scheduleNode?.config ?? {}) as IScheduleTriggerConfig;
  const webhookNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && node.kind === 'webhook'
  );
  const webhookConfig = (webhookNode?.config ?? {}) as IWebhookTriggerConfig;

  useEffect(() => {
    setNameDraft(workflow?.name ?? '');
    setDescriptionDraft(workflow?.description ?? '');
  }, [workflow?.description, workflow?.name]);

  useEffect(() => {
    setScriptDraft(scriptPreview);
  }, [scriptPreview]);

  useEffect(() => {
    if (!hasSelectedActionNode(workflow, selectedScriptNodeId, 'runScript')) {
      setSelectedScriptNodeId(firstScriptNodeId);
    }
  }, [firstScriptNodeId, selectedScriptNodeId, workflow]);

  useEffect(() => {
    setAiPromptDraft(aiPromptPreview);
  }, [aiPromptPreview]);

  useEffect(() => {
    if (!hasSelectedActionNode(workflow, selectedAiNodeId, 'aiGenerate')) {
      setSelectedAiNodeId(firstAiNodeId);
    }
  }, [firstAiNodeId, selectedAiNodeId, workflow]);

  useEffect(() => {
    const hasSelectedRecordAction = workflow?.nodes.some(
      (node) =>
        node.id === selectedRecordActionNodeId &&
        ['updateRecords', 'createRecords', 'queryRecords'].includes(node.kind)
    );
    if (!hasSelectedRecordAction) {
      setSelectedRecordActionNodeId(firstRecordActionNodeId);
    }
  }, [firstRecordActionNodeId, selectedRecordActionNodeId, workflow]);

  useEffect(() => {
    setRecordActionDraft(recordActionPreview);
  }, [recordActionPreview]);

  useEffect(() => {
    const hasSelectedGenericAction = workflow?.nodes.some(
      (node) =>
        node.id === selectedGenericActionNodeId &&
        ['sendEmail', 'httpRequest', 'condition', 'loop'].includes(node.kind)
    );
    if (!hasSelectedGenericAction) {
      setSelectedGenericActionNodeId(firstGenericActionNodeId);
    }
  }, [firstGenericActionNodeId, selectedGenericActionNodeId, workflow]);

  useEffect(() => {
    setGenericActionDraft(genericActionPreview);
  }, [genericActionPreview]);

  useEffect(() => {
    setRecordTriggerTableIdDraft(recordTriggerTableIdPreview);
  }, [recordTriggerTableIdPreview]);

  useEffect(() => {
    setRecordTriggerKindDraft(recordTriggerKindPreview);
  }, [recordTriggerKindPreview]);

  useEffect(() => {
    setRecordTriggerFilterDraft(recordTriggerFilterPreview);
  }, [recordTriggerFilterPreview]);

  useEffect(() => {
    setScheduleModeDraft(scheduleConfig.mode ?? 'manual');
    setScheduleIntervalSecondsDraft(String(scheduleConfig.intervalSeconds ?? 60));
    setScheduleCronDraft(scheduleConfig.cron ?? '*/5 * * * *');
  }, [scheduleConfig.cron, scheduleConfig.intervalSeconds, scheduleConfig.mode]);

  useEffect(() => {
    setWebhookSecretDraft(webhookConfig.secret ?? '');
    setWebhookSignatureSecretDraft(webhookConfig.signatureSecret ?? '');
    setWebhookBodyLimitDraft(String(webhookConfig.bodySizeLimitKb ?? 256));
    setWebhookTimestampToleranceDraft(String(webhookConfig.timestampToleranceSeconds ?? 300));
    setFieldMappingsDraft(JSON.stringify(webhookConfig.fieldMappings ?? {}, null, 2));
    setActivationTestInputDraft(JSON.stringify(webhookConfig.testPlan?.input ?? {}, null, 2));
    setActivationChecksDraft(
      JSON.stringify(webhookConfig.testPlan?.activationChecks ?? [], null, 2)
    );
  }, [
    webhookConfig.bodySizeLimitKb,
    webhookConfig.fieldMappings,
    webhookConfig.secret,
    webhookConfig.signatureSecret,
    webhookConfig.testPlan,
    webhookConfig.timestampToleranceSeconds,
  ]);

  const { data: runs = [] } = useQuery({
    queryKey: selectedId
      ? workflowRunListQueryKey(baseId, selectedId)
      : ['workflow-run-list-disabled', baseId],
    queryFn: () => getWorkflowRunList(baseId, selectedId!).then(({ data }) => data),
    enabled: Boolean(baseId && selectedId) && !isReadOnlyPreview,
  });

  useEffect(() => {
    if (!runs.some((run) => run.id === selectedRunId)) {
      setSelectedRunId(runs[0]?.id);
    }
  }, [runs, selectedRunId]);

  const { data: runDetail } = useQuery({
    queryKey:
      selectedId && selectedRunId
        ? workflowRunDetailQueryKey(baseId, selectedId, selectedRunId)
        : ['workflow-run-detail-disabled', baseId],
    queryFn: () => getWorkflowRun(baseId, selectedId!, selectedRunId!).then(({ data }) => data),
    enabled: Boolean(baseId && selectedId && selectedRunId) && !isReadOnlyPreview,
  });

  useEffect(() => {
    props.onWorkflowChange?.(workflow);
  }, [props, workflow]);

  const refreshWorkflow = async (workflowId?: string) => {
    await queryClient.invalidateQueries({ queryKey: listKey });
    if (workflowId) {
      await queryClient.invalidateQueries({
        queryKey: ReactQueryKeys.workflowItem(baseId, workflowId),
      });
      await queryClient.invalidateQueries({
        queryKey: workflowRunListQueryKey(baseId, workflowId),
      });
      if (selectedRunId) {
        await queryClient.invalidateQueries({
          queryKey: workflowRunDetailQueryKey(baseId, workflowId, selectedRunId),
        });
      }
    }
  };

  const aiDraftMutation = useMutation({
    mutationFn: () =>
      aiCreateWorkflowDraft(baseId, {
        prompt: draftPrompt,
        preferActionKind: inferDraftPreferredActionKind(draftPrompt),
        triggerType: inferDraftTriggerType(draftPrompt),
      }),
    onSuccess: async ({ data }) => {
      toast.success('Workflow draft created');
      setSelectedId(data.id);
      await refreshWorkflow(data.id);
    },
  });

  const recordTriggerMutation = useMutation({
    mutationFn: ({
      triggerType,
      actionKind = 'runScript',
    }: {
      triggerType: WorkflowRecordTriggerKind;
      actionKind?: 'runScript' | 'aiGenerate';
    }) =>
      createWorkflow(baseId, {
        name: getRecordTriggerWorkflowName(triggerType, actionKind),
        description: 'Inactive record trigger workflow draft. Add actions before activation.',
        trigger: {
          type: triggerType,
          config: recordTriggerTableId.trim() ? { tableId: recordTriggerTableId.trim() } : {},
        },
        actions: [buildRecordTriggerAction(triggerType, actionKind)],
      }),
    onSuccess: async ({ data }) => {
      toast.success('Record trigger workflow created');
      setSelectedId(data.id);
      await refreshWorkflow(data.id);
    },
  });

  const webhookTriggerMutation = useMutation({
    mutationFn: () =>
      createWorkflow(baseId, {
        name: 'When webhook is called',
        description: 'Inactive webhook workflow draft. Review the script before activation.',
        trigger: {
          type: 'webhook',
          config: {},
        },
        actions: [
          {
            type: 'runScript',
            config: {
              script: [
                'console.log("Webhook trigger input", input);',
                'return {',
                '  triggerType: "webhook",',
                '  body: input,',
                '};',
              ].join('\n'),
            },
          },
        ],
      }),
    onSuccess: async ({ data }) => {
      toast.success('Webhook workflow created');
      setSelectedId(data.id);
      await refreshWorkflow(data.id);
    },
  });

  const emailTriggerMutation = useMutation({
    mutationFn: () =>
      createWorkflow(baseId, {
        name: 'When email is received',
        description: 'Inactive email-received workflow draft. Review the script before activation.',
        trigger: {
          type: 'emailReceived',
          config: {},
        },
        actions: [
          {
            type: 'runScript',
            config: {
              script: [
                'console.log("Email received trigger input", input);',
                'return {',
                '  triggerType: "emailReceived",',
                '  input,',
                '};',
              ].join('\n'),
            },
          },
        ],
      }),
    onSuccess: async ({ data }) => {
      toast.success('Email received workflow created');
      setSelectedId(data.id);
      await refreshWorkflow(data.id);
    },
  });

  const formTriggerMutation = useMutation({
    mutationFn: () =>
      createWorkflow(baseId, {
        name: 'When form is submitted',
        description: 'Inactive form-submitted workflow draft. Review the script before activation.',
        trigger: {
          type: 'formSubmitted',
          config: {},
        },
        actions: [
          {
            type: 'runScript',
            config: {
              script: [
                'console.log("Form submitted trigger input", input);',
                'return {',
                '  triggerType: "formSubmitted",',
                '  input,',
                '};',
              ].join('\n'),
            },
          },
        ],
      }),
    onSuccess: async ({ data }) => {
      toast.success('Form submitted workflow created');
      setSelectedId(data.id);
      await refreshWorkflow(data.id);
    },
  });

  const scheduleTriggerMutation = useMutation({
    mutationFn: () =>
      createWorkflow(baseId, {
        name: 'On schedule',
        description: 'Inactive schedule workflow draft. Review the script before activation.',
        trigger: {
          type: 'schedule',
          config: { mode: 'manual' },
        },
        actions: [
          {
            type: 'runScript',
            config: {
              script: [
                'console.log("Schedule trigger input", input);',
                'return {',
                '  triggerType: "schedule",',
                '  input,',
                '};',
              ].join('\n'),
            },
          },
        ],
      }),
    onSuccess: async ({ data }) => {
      toast.success('Schedule workflow created');
      setSelectedId(data.id);
      await refreshWorkflow(data.id);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (workflowId: string) => activateWorkflow(baseId, workflowId),
    onSuccess: async ({ data }) => {
      toast.success('Workflow activated');
      await refreshWorkflow(data.id);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (workflowId: string) => deactivateWorkflow(baseId, workflowId),
    onSuccess: async ({ data }) => {
      toast.success('Workflow deactivated');
      await refreshWorkflow(data.id);
    },
  });

  const applyUpdateMutation = useMutation({
    mutationFn: (workflowId: string) => applyUpdateWorkflow(baseId, workflowId),
    onSuccess: async ({ data }) => {
      toast.success('Workflow draft applied to active snapshot');
      await refreshWorkflow(data.id);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (workflowId: string) => deleteWorkflow(baseId, workflowId),
    onSuccess: async () => {
      toast.success('Workflow deleted');
      setSelectedId(undefined);
      await queryClient.invalidateQueries({ queryKey: listKey });
    },
  });

  const testRunMutation = useMutation({
    mutationFn: (workflowId: string) => {
      let parsedInput: Record<string, unknown>;
      try {
        const input = JSON.parse(testRunInputDraft) as unknown;
        if (!input || typeof input !== 'object' || Array.isArray(input)) {
          toast.error('Test run input must be a JSON object');
          return Promise.resolve(undefined);
        }
        parsedInput = input as Record<string, unknown>;
      } catch {
        toast.error('Test run input must be valid JSON');
        return Promise.resolve(undefined);
      }

      return testRunWorkflow(baseId, workflowId, {
        input: {
          ...parsedInput,
          workflowId,
        },
      });
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success(`Workflow test run ${result.data.status}`);
      await refreshWorkflow(result.data.workflowId);
    },
  });

  const testNodeMutation = useMutation({
    mutationFn: async ({ workflowId, nodeId }: { workflowId: string; nodeId: string }) => {
      let parsedInput: Record<string, unknown>;
      try {
        const input = JSON.parse(testRunInputDraft) as unknown;
        if (!input || typeof input !== 'object' || Array.isArray(input)) {
          toast.error('Node test input must be a JSON object');
          return undefined;
        }
        parsedInput = input as Record<string, unknown>;
      } catch {
        toast.error('Node test input must be valid JSON');
        return undefined;
      }

      return testNodeWorkflow(baseId, workflowId, {
        nodeId,
        input: {
          ...parsedInput,
          workflowId,
          nodeId,
        },
      });
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success(`Workflow node test ${result.data.status}`);
      await refreshWorkflow(result.data.workflowId);
    },
  });

  const webhookRunMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      let parsedBody: Record<string, unknown>;
      try {
        const body = JSON.parse(testRunInputDraft) as unknown;
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          toast.error('Webhook input must be a JSON object');
          return undefined;
        }
        parsedBody = body as Record<string, unknown>;
      } catch {
        toast.error('Webhook input must be valid JSON');
        return undefined;
      }

      return triggerWebhookWorkflow(baseId, workflowId, parsedBody, {
        webhookSecret: webhookSecretDraft.trim() || undefined,
      });
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success(`Webhook workflow run ${result.data.status}`);
      await refreshWorkflow(result.data.workflowId);
    },
  });

  const emailReceivedRunMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      let parsedBody: Record<string, unknown>;
      try {
        const body = JSON.parse(testRunInputDraft) as unknown;
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          toast.error('Email input must be a JSON object');
          return undefined;
        }
        parsedBody = body as Record<string, unknown>;
      } catch {
        toast.error('Email input must be valid JSON');
        return undefined;
      }

      return triggerEmailReceivedWorkflow(baseId, workflowId, parsedBody);
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success(`Email received workflow run ${result.data.status}`);
      await refreshWorkflow(result.data.workflowId);
    },
  });

  const scheduleRunMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      let parsedBody: Record<string, unknown>;
      try {
        const body = JSON.parse(testRunInputDraft) as unknown;
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          toast.error('Schedule input must be a JSON object');
          return undefined;
        }
        parsedBody = body as Record<string, unknown>;
      } catch {
        toast.error('Schedule input must be valid JSON');
        return undefined;
      }

      return triggerScheduleWorkflow(baseId, workflowId, parsedBody);
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success(`Schedule workflow run ${result.data.status}`);
      await refreshWorkflow(result.data.workflowId);
    },
  });

  const formSubmittedRunMutation = useMutation({
    mutationFn: async (workflowId: string) => {
      let parsedBody: Record<string, unknown>;
      try {
        const body = JSON.parse(testRunInputDraft) as unknown;
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
          toast.error('Form submitted input must be a JSON object');
          return undefined;
        }
        parsedBody = body as Record<string, unknown>;
      } catch {
        toast.error('Form submitted input must be valid JSON');
        return undefined;
      }

      return triggerFormSubmittedWorkflow(baseId, workflowId, parsedBody);
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success(`Form submitted workflow run ${result.data.status}`);
      await refreshWorkflow(result.data.workflowId);
    },
  });

  const saveMetadataMutation = useMutation({
    mutationFn: async () => {
      if (!workflow) return undefined;
      return updateWorkflow(baseId, workflow.id, {
        name: nameDraft,
        description: descriptionDraft.trim() ? descriptionDraft : null,
      });
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success('Workflow metadata saved');
      await refreshWorkflow(result.data.id);
    },
  });

  const saveScriptMutation = useMutation({
    mutationFn: async () => {
      if (!workflow) return undefined;
      const nodes = workflow.nodes.map((node) => {
        if (
          node.nodeType !== 'action' ||
          node.kind !== 'runScript' ||
          node.id !== activeScriptNodeId
        ) {
          return node;
        }
        const config = (node.config ?? {}) as Record<string, unknown>;
        return {
          ...node,
          config: {
            ...config,
            script: scriptDraft,
          },
        };
      });
      return updateWorkflow(baseId, workflow.id, { nodes });
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success('Run Script draft saved');
      await refreshWorkflow(result.data.id);
    },
  });

  const saveAiPromptMutation = useMutation({
    mutationFn: async () => {
      if (!workflow) return undefined;
      const nodes = workflow.nodes.map((node) => {
        if (
          node.nodeType !== 'action' ||
          node.kind !== 'aiGenerate' ||
          node.id !== activeAiNodeId
        ) {
          return node;
        }
        const config = (node.config ?? {}) as Record<string, unknown>;
        return {
          ...node,
          config: {
            ...config,
            prompt: aiPromptDraft,
          },
        };
      });

      return updateWorkflow(baseId, workflow.id, { nodes });
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success('AI prompt saved');
      await refreshWorkflow(result.data.id);
    },
  });

  const saveRecordActionMutation = useMutation({
    mutationFn: async () => {
      if (!workflow || !selectedRecordActionNodeId || !activeRecordActionKind) return undefined;
      let parsedConfig:
        | IRecordUpdateActionConfig
        | IRecordCreateActionConfig
        | IRecordQueryActionConfig;
      try {
        parsedConfig = JSON.parse(recordActionDraft) as
          | IRecordUpdateActionConfig
          | IRecordCreateActionConfig
          | IRecordQueryActionConfig;
      } catch {
        toast.error('Record action config must be valid JSON');
        return undefined;
      }

      const nodes = workflow.nodes.map((node) => {
        if (node.id !== selectedRecordActionNodeId || node.kind !== activeRecordActionKind) {
          return node;
        }

        return {
          ...node,
          config: parsedConfig,
        };
      });

      return updateWorkflow(baseId, workflow.id, { nodes });
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success('Record action draft saved');
      await refreshWorkflow(result.data.id);
    },
  });

  const saveGenericActionMutation = useMutation({
    mutationFn: async () => {
      if (!workflow || !selectedGenericActionNodeId || !activeGenericActionKind) return undefined;
      let parsedConfig:
        | ISendEmailActionConfig
        | IHttpRequestActionConfig
        | IConditionActionConfig
        | ILoopActionConfig;
      try {
        parsedConfig = JSON.parse(genericActionDraft) as
          | ISendEmailActionConfig
          | IHttpRequestActionConfig
          | IConditionActionConfig
          | ILoopActionConfig;
      } catch {
        toast.error('Generic action config must be valid JSON');
        return undefined;
      }

      const nodes = workflow.nodes.map((node) => {
        if (node.id !== selectedGenericActionNodeId || node.kind !== activeGenericActionKind) {
          return node;
        }

        return {
          ...node,
          config: parsedConfig,
        };
      });

      return updateWorkflow(baseId, workflow.id, { nodes });
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success('Generic action draft saved');
      await refreshWorkflow(result.data.id);
    },
  });

  const saveRecordTriggerMutation = useMutation({
    mutationFn: async () => {
      if (!workflow) return undefined;
      try {
        const nodes = buildUpdatedTriggerNodes({
          workflow,
          recordTriggerKindDraft,
          recordTriggerTableIdDraft,
          recordTriggerFilterDraft,
          webhookSecretDraft,
          webhookSignatureSecretDraft,
          webhookBodyLimitDraft,
          webhookTimestampToleranceDraft,
          fieldMappingsDraft,
          activationTestInputDraft,
          activationChecksDraft,
          scheduleModeDraft,
          scheduleIntervalSecondsDraft,
          scheduleCronDraft,
        });

        return updateWorkflow(baseId, workflow.id, { nodes });
      } catch {
        if (scheduleModeDraft === 'interval') {
          toast.error('Schedule interval must be a positive number');
          return undefined;
        }
        if (scheduleModeDraft === 'cron' && !scheduleCronDraft.trim()) {
          toast.error('Schedule cron expression is required');
          return undefined;
        }
        toast.error('Trigger config drafts must be valid JSON');
        return undefined;
      }
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success('Record trigger draft saved');
      await refreshWorkflow(result.data.id);
    },
  });

  const addActionMutation = useMutation({
    mutationFn: async (kind: WorkflowActionKind) => {
      if (!workflow) return undefined;
      return updateWorkflow(baseId, workflow.id, { nodes: appendActionNode(workflow, kind) });
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success('Workflow action added');
      await refreshWorkflow(result.data.id);
    },
  });

  const removeActionMutation = useMutation({
    mutationFn: async (nodeId: string) => {
      if (!workflow) return undefined;
      return updateWorkflow(baseId, workflow.id, { nodes: removeActionNode(workflow, nodeId) });
    },
    onSuccess: async (result) => {
      if (!result?.data) return;
      toast.success('Workflow action removed');
      await refreshWorkflow(result.data.id);
    },
  });

  const handleSelectWorkflow = (item: IWorkflowVo) => {
    setSelectedId(item.id);
    setSelectedRunId(undefined);
  };

  const handleToggleActive = () => {
    if (!workflow) return;
    if (workflow.isActive) {
      deactivateMutation.mutate(workflow.id);
    } else {
      activateMutation.mutate(workflow.id);
    }
  };

  const applyUpdateDisabledReason =
    workflow?.isActive === true
      ? undefined
      : 'Activate the workflow before applying draft updates to the active snapshot.';

  const handleApplyUpdate = () => {
    if (!workflow?.isActive) return;
    applyUpdateMutation.mutate(workflow.id);
  };

  if (isReadOnlyPreview) {
    return (
      <div className="h-full flex-col md:flex">
        <Head>
          <title>{t('noun.automation')}</title>
        </Head>
        <div className="flex flex-col gap-2 lg:gap-4">
          <div className="items-center justify-between space-y-2 px-8 pb-2 pt-6 lg:flex">
            <h2 className="text-3xl font-bold tracking-tight">{t('noun.automation')}</h2>
          </div>
        </div>
        <div className="flex h-full items-center justify-center p-4">
          {/* In preview mode, the actual WorkFlowPanel component will be rendered via override */}
          <div className="text-sm text-muted-foreground">{t('noun.automation')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <Head>
        <title>{t('noun.automation')}</title>
      </Head>
      <div className="flex shrink-0 items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          {props.headLeft}
          <h2 className="text-3xl font-bold tracking-tight">{t('noun.automation')}</h2>
          <Badge variant="secondary">Open workflow runtime</Badge>
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <WorkflowSidebar
          workflows={workflows}
          selectedId={selectedId}
          draftPrompt={draftPrompt}
          recordTriggerTableId={recordTriggerTableId}
          isCreatingDraft={aiDraftMutation.isPending}
          isCreatingRecordTrigger={recordTriggerMutation.isPending}
          isCreatingEmailTrigger={emailTriggerMutation.isPending}
          isCreatingFormTrigger={formTriggerMutation.isPending}
          isCreatingScheduleTrigger={scheduleTriggerMutation.isPending}
          isCreatingWebhookTrigger={webhookTriggerMutation.isPending}
          onDraftPromptChange={setDraftPrompt}
          onCreateDraft={() => aiDraftMutation.mutate()}
          onRecordTriggerTableIdChange={setRecordTriggerTableId}
          onCreateRecordTrigger={(triggerType, actionKind) =>
            recordTriggerMutation.mutate({ triggerType, actionKind })
          }
          onCreateEmailTrigger={() => emailTriggerMutation.mutate()}
          onCreateFormTrigger={() => formTriggerMutation.mutate()}
          onCreateScheduleTrigger={() => scheduleTriggerMutation.mutate()}
          onCreateWebhookTrigger={() => webhookTriggerMutation.mutate()}
          onSelectWorkflow={handleSelectWorkflow}
        />

        <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <WorkflowDetail
            workflow={workflow}
            nameDraft={nameDraft}
            descriptionDraft={descriptionDraft}
            scriptPreview={scriptPreview}
            scriptDraft={scriptDraft}
            selectedScriptNodeId={activeScriptNodeId}
            aiPromptPreview={aiPromptPreview}
            aiPromptDraft={aiPromptDraft}
            selectedAiNodeId={activeAiNodeId}
            selectedRecordActionNodeId={selectedRecordActionNodeId}
            recordActionDraft={recordActionDraft}
            activeRecordActionKind={activeRecordActionKind}
            selectedGenericActionNodeId={selectedGenericActionNodeId}
            genericActionDraft={genericActionDraft}
            activeGenericActionKind={activeGenericActionKind}
            webhookSecretDraft={webhookSecretDraft}
            webhookSignatureSecretDraft={webhookSignatureSecretDraft}
            webhookBodyLimitDraft={webhookBodyLimitDraft}
            webhookTimestampToleranceDraft={webhookTimestampToleranceDraft}
            fieldMappingsDraft={fieldMappingsDraft}
            activationTestInputDraft={activationTestInputDraft}
            activationChecksDraft={activationChecksDraft}
            testRunInputDraft={testRunInputDraft}
            runDetail={runDetail}
            recordTriggerTableIdPreview={recordTriggerTableIdPreview}
            recordTriggerTableIdDraft={recordTriggerTableIdDraft}
            recordTriggerKindDraft={recordTriggerKindDraft}
            recordTriggerFilterDraft={recordTriggerFilterDraft}
            scheduleModeDraft={scheduleModeDraft}
            scheduleIntervalSecondsDraft={scheduleIntervalSecondsDraft}
            scheduleCronDraft={scheduleCronDraft}
            isActivating={activateMutation.isPending}
            isApplyingUpdate={applyUpdateMutation.isPending}
            isDeactivating={deactivateMutation.isPending}
            isDeleting={deleteMutation.isPending}
            isTesting={testRunMutation.isPending}
            isSavingMetadata={saveMetadataMutation.isPending}
            isSavingScript={saveScriptMutation.isPending}
            isSavingAiPrompt={saveAiPromptMutation.isPending}
            isSavingRecordAction={saveRecordActionMutation.isPending}
            isSavingGenericAction={saveGenericActionMutation.isPending}
            isSavingRecordTrigger={saveRecordTriggerMutation.isPending}
            isAddingAction={addActionMutation.isPending}
            isRemovingAction={removeActionMutation.isPending}
            isTestingNode={testNodeMutation.isPending}
            actionCapabilities={actionCapabilities}
            applyUpdateDisabled={!workflow?.isActive}
            applyUpdateDisabledReason={applyUpdateDisabledReason}
            onApplyUpdate={handleApplyUpdate}
            onToggleActive={handleToggleActive}
            onDelete={(workflowId) => deleteMutation.mutate(workflowId)}
            onTriggerEmailReceived={(workflowId) => emailReceivedRunMutation.mutate(workflowId)}
            onTestRun={(workflowId) => testRunMutation.mutate(workflowId)}
            onTriggerFormSubmitted={(workflowId) => formSubmittedRunMutation.mutate(workflowId)}
            onTriggerSchedule={(workflowId) => scheduleRunMutation.mutate(workflowId)}
            onTriggerWebhook={(workflowId) => webhookRunMutation.mutate(workflowId)}
            onNameDraftChange={setNameDraft}
            onDescriptionDraftChange={setDescriptionDraft}
            onTestRunInputDraftChange={setTestRunInputDraft}
            onSaveMetadata={() => saveMetadataMutation.mutate()}
            onSelectScriptNode={setSelectedScriptNodeId}
            onScriptDraftChange={setScriptDraft}
            onSaveScript={() => saveScriptMutation.mutate()}
            onSelectAiNode={setSelectedAiNodeId}
            onAiPromptDraftChange={setAiPromptDraft}
            onSelectRecordActionNode={setSelectedRecordActionNodeId}
            onSelectGenericActionNode={setSelectedGenericActionNodeId}
            onRecordActionDraftChange={setRecordActionDraft}
            onGenericActionDraftChange={setGenericActionDraft}
            onSaveAiPrompt={() => saveAiPromptMutation.mutate()}
            onRecordTriggerKindDraftChange={setRecordTriggerKindDraft}
            onRecordTriggerTableIdDraftChange={setRecordTriggerTableIdDraft}
            onRecordTriggerFilterDraftChange={setRecordTriggerFilterDraft}
            onWebhookSecretDraftChange={setWebhookSecretDraft}
            onWebhookSignatureSecretDraftChange={setWebhookSignatureSecretDraft}
            onWebhookBodyLimitDraftChange={setWebhookBodyLimitDraft}
            onWebhookTimestampToleranceDraftChange={setWebhookTimestampToleranceDraft}
            onFieldMappingsDraftChange={setFieldMappingsDraft}
            onActivationTestInputDraftChange={setActivationTestInputDraft}
            onActivationChecksDraftChange={setActivationChecksDraft}
            onScheduleModeDraftChange={setScheduleModeDraft}
            onScheduleIntervalSecondsDraftChange={setScheduleIntervalSecondsDraft}
            onScheduleCronDraftChange={setScheduleCronDraft}
            onSaveRecordAction={() => saveRecordActionMutation.mutate()}
            onSaveGenericAction={() => saveGenericActionMutation.mutate()}
            onSaveRecordTrigger={() => saveRecordTriggerMutation.mutate()}
            onAddAction={(kind) => addActionMutation.mutate(kind)}
            onRemoveAction={(nodeId) => removeActionMutation.mutate(nodeId)}
            onTestNode={(nodeId) =>
              workflow && testNodeMutation.mutate({ workflowId: workflow.id, nodeId })
            }
          />
          <RunHistory
            runs={runs}
            selectedRunId={selectedRunId}
            runDetail={runDetail}
            onSelectRun={setSelectedRunId}
          />
        </div>
      </div>
    </div>
  );
}
