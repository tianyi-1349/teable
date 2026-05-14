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
  createWorkflow,
  deactivateWorkflow,
  deleteWorkflow,
  getWorkflow,
  getWorkflowCapabilities,
  getWorkflowList,
  getWorkflowRun,
  getWorkflowRunList,
  testRunWorkflow,
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
  removeActionNode,
  type WorkflowActionKind,
} from './lib/workflowNodes';

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

interface IWorkflowSidebarProps {
  workflows: IWorkflowVo[];
  selectedId?: string;
  draftPrompt: string;
  recordTriggerTableId: string;
  isCreatingDraft: boolean;
  isCreatingRecordTrigger: boolean;
  onDraftPromptChange: (value: string) => void;
  onCreateDraft: () => void;
  onRecordTriggerTableIdChange: (value: string) => void;
  onCreateRecordTrigger: (
    triggerType: 'recordCreated' | 'recordUpdated',
    actionKind?: 'runScript' | 'aiGenerate'
  ) => void;
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
    onDraftPromptChange,
    onCreateDraft,
    onRecordTriggerTableIdChange,
    onCreateRecordTrigger,
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
            onClick={() => onCreateRecordTrigger('recordCreated', 'aiGenerate')}
          >
            AI summarize on create
          </Button>
          <p className="text-xs text-muted-foreground">
            Leave table id empty to listen to all tables in this base.
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
  recordTriggerTableIdPreview: string;
  recordTriggerTableIdDraft: string;
  recordTriggerKindDraft: 'recordCreated' | 'recordUpdated';
  recordTriggerFilterDraft: string;
  isActivating: boolean;
  isDeactivating: boolean;
  isDeleting: boolean;
  isTesting: boolean;
  isSavingMetadata: boolean;
  isSavingScript: boolean;
  isSavingAiPrompt: boolean;
  isSavingRecordTrigger: boolean;
  isAddingAction: boolean;
  isRemovingAction: boolean;
  actionCapabilities: IWorkflowActionCapabilityMap;
  onToggleActive: () => void;
  onDelete: (workflowId: string) => void;
  onTestRun: (workflowId: string) => void;
  onNameDraftChange: (value: string) => void;
  onDescriptionDraftChange: (value: string) => void;
  onSaveMetadata: () => void;
  onSaveScript: () => void;
  onSaveAiPrompt: () => void;
  onSelectScriptNode: (nodeId: string) => void;
  onScriptDraftChange: (value: string) => void;
  onSelectAiNode: (nodeId: string) => void;
  onAiPromptDraftChange: (value: string) => void;
  onRecordTriggerKindDraftChange: (value: 'recordCreated' | 'recordUpdated') => void;
  onRecordTriggerTableIdDraftChange: (value: string) => void;
  onRecordTriggerFilterDraftChange: (value: string) => void;
  onSaveRecordTrigger: () => void;
  onAddAction: (kind: WorkflowActionKind) => void;
  onRemoveAction: (nodeId: string) => void;
}

interface IWorkflowNodeCardProps {
  node: IWorkflowNode;
  selectedScriptNodeId?: string;
  selectedAiNodeId?: string;
  isRemovingAction: boolean;
  onSelectScriptNode: (nodeId: string) => void;
  onSelectAiNode: (nodeId: string) => void;
  onRemoveAction: (nodeId: string) => void;
}

const WorkflowNodeCard = (props: IWorkflowNodeCardProps) => {
  const {
    node,
    selectedScriptNodeId,
    selectedAiNodeId,
    isRemovingAction,
    onSelectScriptNode,
    onSelectAiNode,
    onRemoveAction,
  } = props;
  const isAction = node.nodeType === 'action';
  const isRunScript = isAction && node.kind === 'runScript';
  const isAiGenerate = isAction && node.kind === 'aiGenerate';
  const isUpdateRecords = isAction && node.kind === 'updateRecords';
  const isCreateRecords = isAction && node.kind === 'createRecords';
  const isQueryRecords = isAction && node.kind === 'queryRecords';

  return (
    <div className="rounded-lg border p-3 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium">{node.kind}</div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{node.nodeType}</Badge>
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
        <Button size="sm" variant="outline" className="mt-3" disabled>
          Edit record update (coming soon)
        </Button>
      )}
      {isCreateRecords && (
        <Button size="sm" variant="outline" className="mt-3" disabled>
          Edit record create (coming soon)
        </Button>
      )}
      {isQueryRecords && (
        <Button size="sm" variant="outline" className="mt-3" disabled>
          Edit record query (coming soon)
        </Button>
      )}
    </div>
  );
};

interface IWorkflowDetailHeaderProps {
  workflow?: IWorkflowDetailVo;
  isActivating: boolean;
  isDeactivating: boolean;
  isDeleting: boolean;
  isTesting: boolean;
  testRunDisabled?: boolean;
  testRunDisabledReason?: string;
  onToggleActive: () => void;
  onDelete: (workflowId: string) => void;
  onTestRun: (workflowId: string) => void;
}

const WorkflowDetailHeader = (props: IWorkflowDetailHeaderProps) => {
  const {
    workflow,
    isActivating,
    isDeactivating,
    isDeleting,
    isTesting,
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
            disabled={isTesting || testRunDisabled}
            title={testRunDisabledReason}
            onClick={() => props.onTestRun(workflow.id)}
          >
            Test run
          </Button>
          <Button
            size="sm"
            variant={workflow.isActive ? 'outline' : 'default'}
            disabled={isActivating || isDeactivating}
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
          node.nodeType === 'trigger' && ['recordCreated', 'recordUpdated'].includes(node.kind)
      )
  ),
});

const getTestRunAvailability = (
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
    recordTriggerTableIdPreview,
    recordTriggerTableIdDraft,
    recordTriggerKindDraft,
    recordTriggerFilterDraft,
    isActivating,
    isDeactivating,
    isDeleting,
    isTesting,
    isSavingMetadata,
    isSavingScript,
    isSavingAiPrompt,
    isSavingRecordTrigger,
    isAddingAction,
    isRemovingAction,
    actionCapabilities,
    onToggleActive,
    onDelete,
    onTestRun,
    onNameDraftChange,
    onDescriptionDraftChange,
    onSaveMetadata,
    onSelectScriptNode,
    onScriptDraftChange,
    onSaveScript,
    onSelectAiNode,
    onAiPromptDraftChange,
    onSaveAiPrompt,
    onRecordTriggerKindDraftChange,
    onRecordTriggerTableIdDraftChange,
    onRecordTriggerFilterDraftChange,
    onSaveRecordTrigger,
    onAddAction,
    onRemoveAction,
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
  const testRunAvailability = getTestRunAvailability(workflow, actionCapabilities);

  return (
    <Card className="min-h-0 overflow-hidden">
      <WorkflowDetailHeader
        workflow={workflow}
        isActivating={isActivating}
        isDeactivating={isDeactivating}
        isDeleting={isDeleting}
        isTesting={isTesting}
        testRunDisabled={testRunAvailability.disabled}
        testRunDisabledReason={testRunAvailability.reason}
        onToggleActive={onToggleActive}
        onDelete={onDelete}
        onTestRun={onTestRun}
      />
      <CardContent className="space-y-4 overflow-auto">
        {workflow ? (
          <>
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
              </div>
              {workflow.nodes.map((node) => (
                <WorkflowNodeCard
                  key={node.id}
                  node={node}
                  selectedScriptNodeId={selectedScriptNodeId}
                  selectedAiNodeId={selectedAiNodeId}
                  isRemovingAction={isRemovingAction}
                  onSelectScriptNode={onSelectScriptNode}
                  onSelectAiNode={onSelectAiNode}
                  onRemoveAction={onRemoveAction}
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
                  onRecordTriggerKindDraftChange(value as 'recordCreated' | 'recordUpdated')
                }
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recordCreated">When record is created</SelectItem>
                  <SelectItem value="recordUpdated">When record is updated</SelectItem>
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
  const [recordTriggerTableIdDraft, setRecordTriggerTableIdDraft] = useState('');
  const [recordTriggerKindDraft, setRecordTriggerKindDraft] = useState<
    'recordCreated' | 'recordUpdated'
  >('recordCreated');
  const [recordTriggerFilterDraft, setRecordTriggerFilterDraft] = useState('');

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
  const activeScriptNodeId = getActiveActionNodeId(workflow, selectedScriptNodeId, 'runScript');
  const activeAiNodeId = getActiveActionNodeId(workflow, selectedAiNodeId, 'aiGenerate');
  const scriptPreview = getScriptPreview(workflow, activeScriptNodeId);
  const aiPromptPreview = getAiGeneratePrompt(workflow, activeAiNodeId);
  const recordTriggerTableIdPreview = getRecordTriggerTableId(workflow);
  const recordTriggerKindPreview = getRecordTriggerKind(workflow);
  const recordTriggerFilterPreview = getRecordTriggerFilterText(workflow);

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
    setRecordTriggerTableIdDraft(recordTriggerTableIdPreview);
  }, [recordTriggerTableIdPreview]);

  useEffect(() => {
    setRecordTriggerKindDraft(recordTriggerKindPreview);
  }, [recordTriggerKindPreview]);

  useEffect(() => {
    setRecordTriggerFilterDraft(recordTriggerFilterPreview);
  }, [recordTriggerFilterPreview]);

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
    mutationFn: () => aiCreateWorkflowDraft(baseId, { prompt: draftPrompt }),
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
      triggerType: 'recordCreated' | 'recordUpdated';
      actionKind?: 'runScript' | 'aiGenerate';
    }) =>
      createWorkflow(baseId, {
        name:
          actionKind === 'aiGenerate'
            ? 'Summarize new record with AI'
            : triggerType === 'recordCreated'
              ? 'When record is created'
              : 'When record is updated',
        description: 'Inactive record trigger workflow draft. Add actions before activation.',
        trigger: {
          type: triggerType,
          config: recordTriggerTableId.trim() ? { tableId: recordTriggerTableId.trim() } : {},
        },
        actions: [
          actionKind === 'aiGenerate'
            ? {
                type: 'aiGenerate',
                config: {
                  prompt:
                    'Summarize this automation trigger input in one concise paragraph: {{ input }}',
                },
              }
            : {
                type: 'runScript',
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
              },
        ],
      }),
    onSuccess: async ({ data }) => {
      toast.success('Record trigger workflow created');
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

  const deleteMutation = useMutation({
    mutationFn: (workflowId: string) => deleteWorkflow(baseId, workflowId),
    onSuccess: async () => {
      toast.success('Workflow deleted');
      setSelectedId(undefined);
      await queryClient.invalidateQueries({ queryKey: listKey });
    },
  });

  const testRunMutation = useMutation({
    mutationFn: (workflowId: string) =>
      testRunWorkflow(baseId, workflowId, {
        input: {
          manual: true,
          source: 'workflowWorkspace',
          workflowId,
        },
      }),
    onSuccess: async ({ data }) => {
      toast.success(`Workflow test run ${data.status}`);
      await refreshWorkflow(data.workflowId);
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

  const saveRecordTriggerMutation = useMutation({
    mutationFn: async () => {
      if (!workflow) return undefined;
      const tableId = recordTriggerTableIdDraft.trim();
      let filter: Record<string, unknown> | undefined;
      try {
        const parsedFilter = parseOptionalJson(recordTriggerFilterDraft);
        filter =
          parsedFilter && typeof parsedFilter === 'object'
            ? (parsedFilter as Record<string, unknown>)
            : undefined;
      } catch {
        toast.error('Record trigger filter must be valid JSON');
        return undefined;
      }
      const nodes = workflow.nodes.map((node) => {
        if (
          node.nodeType !== 'trigger' ||
          !['recordCreated', 'recordUpdated'].includes(node.kind)
        ) {
          return node;
        }
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
      });
      return updateWorkflow(baseId, workflow.id, { nodes });
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
          onDraftPromptChange={setDraftPrompt}
          onCreateDraft={() => aiDraftMutation.mutate()}
          onRecordTriggerTableIdChange={setRecordTriggerTableId}
          onCreateRecordTrigger={(triggerType, actionKind) =>
            recordTriggerMutation.mutate({ triggerType, actionKind })
          }
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
            recordTriggerTableIdPreview={recordTriggerTableIdPreview}
            recordTriggerTableIdDraft={recordTriggerTableIdDraft}
            recordTriggerKindDraft={recordTriggerKindDraft}
            recordTriggerFilterDraft={recordTriggerFilterDraft}
            isActivating={activateMutation.isPending}
            isDeactivating={deactivateMutation.isPending}
            isDeleting={deleteMutation.isPending}
            isTesting={testRunMutation.isPending}
            isSavingMetadata={saveMetadataMutation.isPending}
            isSavingScript={saveScriptMutation.isPending}
            isSavingAiPrompt={saveAiPromptMutation.isPending}
            isSavingRecordTrigger={saveRecordTriggerMutation.isPending}
            isAddingAction={addActionMutation.isPending}
            isRemovingAction={removeActionMutation.isPending}
            actionCapabilities={actionCapabilities}
            onToggleActive={handleToggleActive}
            onDelete={(workflowId) => deleteMutation.mutate(workflowId)}
            onTestRun={(workflowId) => testRunMutation.mutate(workflowId)}
            onNameDraftChange={setNameDraft}
            onDescriptionDraftChange={setDescriptionDraft}
            onSaveMetadata={() => saveMetadataMutation.mutate()}
            onSelectScriptNode={setSelectedScriptNodeId}
            onScriptDraftChange={setScriptDraft}
            onSaveScript={() => saveScriptMutation.mutate()}
            onSelectAiNode={setSelectedAiNodeId}
            onAiPromptDraftChange={setAiPromptDraft}
            onSaveAiPrompt={() => saveAiPromptMutation.mutate()}
            onRecordTriggerKindDraftChange={setRecordTriggerKindDraft}
            onRecordTriggerTableIdDraftChange={setRecordTriggerTableIdDraft}
            onRecordTriggerFilterDraftChange={setRecordTriggerFilterDraft}
            onSaveRecordTrigger={() => saveRecordTriggerMutation.mutate()}
            onAddAction={(kind) => addActionMutation.mutate(kind)}
            onRemoveAction={(nodeId) => removeActionMutation.mutate(nodeId)}
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
