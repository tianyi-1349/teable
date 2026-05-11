import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { IWorkflowDetailVo, IWorkflowVo } from '@teable/openapi';
import {
  activateWorkflow,
  aiCreateWorkflowDraft,
  createWorkflow,
  deactivateWorkflow,
  deleteWorkflow,
  getWorkflow,
  getWorkflowList,
  getWorkflowRunList,
  testRunWorkflow,
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
  Textarea,
  cn,
} from '@teable/ui-lib/shadcn';
import { toast } from '@teable/ui-lib/shadcn/ui/sonner';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect, useMemo, useState } from 'react';

interface IAutomationPageProps {
  baseId?: string;
  workflowId?: string;
  headLeft?: React.ReactNode;
  onWorkflowChange?: (workflow?: IWorkflowDetailVo) => void;
}

const workflowListQueryKey = (baseId: string) => ['workflow-list', baseId] as const;
const workflowRunListQueryKey = (baseId: string, workflowId: string) =>
  ['workflow-run-list', baseId, workflowId] as const;

const getStatusTone = (status: string) => {
  if (status === 'completed') return 'text-emerald-600';
  if (status === 'failed') return 'text-destructive';
  if (status === 'running') return 'text-blue-600';
  return 'text-muted-foreground';
};

const getScriptPreview = (workflow?: IWorkflowDetailVo) => {
  const runScriptNode = workflow?.nodes.find(
    (node) => node.nodeType === 'action' && node.kind === 'runScript'
  );
  const config = runScriptNode?.config as { script?: string; code?: string } | undefined;
  return config?.script ?? config?.code ?? '';
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
  onCreateRecordTrigger: (triggerType: 'recordCreated' | 'recordUpdated') => void;
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
  scriptPreview: string;
  isActivating: boolean;
  isDeactivating: boolean;
  isDeleting: boolean;
  isTesting: boolean;
  onToggleActive: () => void;
  onDelete: (workflowId: string) => void;
  onTestRun: (workflowId: string) => void;
}

const WorkflowDetail = (props: IWorkflowDetailProps) => {
  const {
    workflow,
    scriptPreview,
    isActivating,
    isDeactivating,
    isDeleting,
    isTesting,
    onToggleActive,
    onDelete,
    onTestRun,
  } = props;

  return (
    <Card className="min-h-0 overflow-hidden">
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
              disabled={isTesting}
              onClick={() => onTestRun(workflow.id)}
            >
              Test run
            </Button>
            <Button
              size="sm"
              variant={workflow.isActive ? 'outline' : 'default'}
              disabled={isActivating || isDeactivating}
              onClick={onToggleActive}
            >
              {workflow.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => onDelete(workflow.id)}
            >
              Delete
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4 overflow-auto">
        {workflow ? (
          <>
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
              {workflow.nodes.map((node) => (
                <div key={node.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium">{node.kind}</div>
                    <Badge variant="outline">{node.nodeType}</Badge>
                  </div>
                  <div className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                    <div>id: {node.id}</div>
                    <div>next: {node.nextNodeId ?? 'none'}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Run Script preview</div>
              <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/40 p-3 text-xs">
                {scriptPreview || 'No runScript action configured.'}
              </pre>
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
}

const RunHistory = ({ runs }: IRunHistoryProps) => {
  return (
    <Card className="min-h-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Run history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 overflow-auto">
        {runs.map((run) => (
          <div key={run.id} className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className={cn('font-medium', getStatusTone(run.status))}>{run.status}</span>
              <span className="text-xs text-muted-foreground">{run.durationMs ?? 0} ms</span>
            </div>
            <div className="mt-2 truncate text-xs text-muted-foreground">{run.id}</div>
          </div>
        ))}
        {!runs.length && (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No runs yet. Activate a workflow and click its linked button field to run it.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function AutomationPage(props: IAutomationPageProps = {}) {
  const router = useRouter();
  const routeBaseId = useBaseId();
  const baseId = props.baseId ?? routeBaseId ?? (router.query.baseId as string | undefined) ?? '';
  const selectedWorkflowId =
    props.workflowId ?? (router.query.workflowId as string | undefined) ?? undefined;
  const { t } = useTranslation('common');
  const isReadOnlyPreview = useIsReadOnlyPreview();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedWorkflowId);
  const [draftPrompt, setDraftPrompt] = useState(
    'When the button is clicked, inspect the record and return a short summary.'
  );
  const [recordTriggerTableId, setRecordTriggerTableId] = useState('');

  const listKey = useMemo(() => workflowListQueryKey(baseId), [baseId]);
  const { data: workflows = [] } = useQuery({
    queryKey: listKey,
    queryFn: () => getWorkflowList(baseId).then(({ data }) => data),
    enabled: Boolean(baseId) && !isReadOnlyPreview,
  });

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

  const { data: runs = [] } = useQuery({
    queryKey: selectedId
      ? workflowRunListQueryKey(baseId, selectedId)
      : ['workflow-run-list-disabled', baseId],
    queryFn: () => getWorkflowRunList(baseId, selectedId!).then(({ data }) => data),
    enabled: Boolean(baseId && selectedId) && !isReadOnlyPreview,
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
    mutationFn: (triggerType: 'recordCreated' | 'recordUpdated') =>
      createWorkflow(baseId, {
        name: triggerType === 'recordCreated' ? 'When record is created' : 'When record is updated',
        description: 'Inactive record trigger workflow draft. Add actions before activation.',
        trigger: {
          type: triggerType,
          config: recordTriggerTableId.trim() ? { tableId: recordTriggerTableId.trim() } : {},
        },
        actions: [
          {
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

  const handleSelectWorkflow = (item: IWorkflowVo) => {
    setSelectedId(item.id);
  };

  const handleToggleActive = () => {
    if (!workflow) return;
    if (workflow.isActive) {
      deactivateMutation.mutate(workflow.id);
    } else {
      activateMutation.mutate(workflow.id);
    }
  };

  const scriptPreview = getScriptPreview(workflow);

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
          onCreateRecordTrigger={(triggerType) => recordTriggerMutation.mutate(triggerType)}
          onSelectWorkflow={handleSelectWorkflow}
        />

        <div className="grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <WorkflowDetail
            workflow={workflow}
            scriptPreview={scriptPreview}
            isActivating={activateMutation.isPending}
            isDeactivating={deactivateMutation.isPending}
            isDeleting={deleteMutation.isPending}
            isTesting={testRunMutation.isPending}
            onToggleActive={handleToggleActive}
            onDelete={(workflowId) => deleteMutation.mutate(workflowId)}
            onTestRun={(workflowId) => testRunMutation.mutate(workflowId)}
          />
          <RunHistory runs={runs} />
        </div>
      </div>
    </div>
  );
}
