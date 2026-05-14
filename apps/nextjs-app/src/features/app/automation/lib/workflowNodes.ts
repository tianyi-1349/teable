import { generateWorkflowActionId } from '@teable/core';
import type { IWorkflowDetailVo, IWorkflowNode } from '@teable/openapi';

export interface IRecordUpdateActionConfig {
  tableId: string;
  recordId: string;
  fields: Record<string, unknown>;
}

export interface IRecordCreateActionConfig {
  tableId: string;
  records: Record<string, unknown>[];
}

export interface IRecordQueryActionConfig {
  tableId: string;
  filter?: Record<string, unknown>;
  take?: number;
}

export type WorkflowActionKind =
  | 'runScript'
  | 'aiGenerate'
  | 'updateRecords'
  | 'createRecords'
  | 'queryRecords';

const triggerInputTableIdTemplate = '{{ input.tableId }}';

export const getScriptPreview = (workflow?: IWorkflowDetailVo, nodeId?: string) => {
  const runScriptNode = workflow?.nodes.find(
    (node) =>
      node.nodeType === 'action' && node.kind === 'runScript' && (!nodeId || node.id === nodeId)
  );
  const config = runScriptNode?.config as { script?: string; code?: string } | undefined;
  return config?.script ?? config?.code ?? '';
};

export const getAiGeneratePrompt = (workflow?: IWorkflowDetailVo, nodeId?: string) => {
  const aiGenerateNode = workflow?.nodes.find(
    (node) =>
      node.nodeType === 'action' && node.kind === 'aiGenerate' && (!nodeId || node.id === nodeId)
  );
  const config = aiGenerateNode?.config as { prompt?: string } | undefined;
  return config?.prompt ?? '';
};

export const getRecordTriggerTableId = (workflow?: IWorkflowDetailVo) => {
  const recordTriggerNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && ['recordCreated', 'recordUpdated'].includes(node.kind)
  );
  const config = recordTriggerNode?.config as { tableId?: string } | undefined;
  return config?.tableId ?? '';
};

export const getRecordTriggerKind = (workflow?: IWorkflowDetailVo) => {
  const recordTriggerNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && ['recordCreated', 'recordUpdated'].includes(node.kind)
  );
  return recordTriggerNode?.kind === 'recordUpdated' ? 'recordUpdated' : 'recordCreated';
};

export const getRecordTriggerFilterText = (workflow?: IWorkflowDetailVo) => {
  const recordTriggerNode = workflow?.nodes.find(
    (node) => node.nodeType === 'trigger' && ['recordCreated', 'recordUpdated'].includes(node.kind)
  );
  const config = recordTriggerNode?.config as { filter?: unknown } | undefined;
  return config?.filter ? JSON.stringify(config.filter, null, 2) : '';
};

export const appendActionNode = (
  workflow: IWorkflowDetailVo,
  kind: WorkflowActionKind
): IWorkflowNode[] => {
  const actionNodes = workflow.nodes.filter((node) => node.nodeType === 'action');
  const triggerNode = workflow.nodes.find((node) => node.nodeType === 'trigger');
  const previousNode = actionNodes[actionNodes.length - 1] ?? triggerNode;
  const newNodeId = generateWorkflowActionId();

  let config:
    | IRecordUpdateActionConfig
    | IRecordCreateActionConfig
    | IRecordQueryActionConfig
    | { script: string }
    | { prompt: string };
  switch (kind) {
    case 'aiGenerate':
      config = { prompt: 'Summarize this automation input: {{ input }}' };
      break;
    case 'runScript':
      config = {
        script: ['console.log("Automation input", input);', 'return {', '  input,', '};'].join(
          '\n'
        ),
      };
      break;
    case 'updateRecords':
      config = {
        tableId: triggerInputTableIdTemplate,
        recordId: '{{ input.record.id }}',
        fields: {},
      };
      break;
    case 'createRecords':
      config = { tableId: triggerInputTableIdTemplate, records: [{}] };
      break;
    case 'queryRecords':
      config = { tableId: triggerInputTableIdTemplate, filter: {}, take: 10 };
      break;
  }

  const newNode: IWorkflowNode = {
    id: newNodeId,
    workflowId: workflow.id,
    nodeType: 'action',
    kind,
    parentNodeId: previousNode?.id,
    config,
  };

  return [
    ...workflow.nodes.map((node) =>
      node.id === previousNode?.id ? { ...node, nextNodeId: newNodeId } : node
    ),
    newNode,
  ];
};

export const removeActionNode = (workflow: IWorkflowDetailVo, nodeId: string): IWorkflowNode[] => {
  const nodeToRemove = workflow.nodes.find((node) => node.id === nodeId);
  if (!nodeToRemove || nodeToRemove.nodeType !== 'action') {
    return workflow.nodes;
  }

  return workflow.nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => {
      if (node.id === nodeToRemove.parentNodeId) {
        return { ...node, nextNodeId: nodeToRemove.nextNodeId };
      }
      if (node.id === nodeToRemove.nextNodeId) {
        return { ...node, parentNodeId: nodeToRemove.parentNodeId };
      }
      return node;
    });
};

export const hasSelectedActionNode = (
  workflow: IWorkflowDetailVo | undefined,
  nodeId: string | undefined,
  kind: WorkflowActionKind
) => Boolean(workflow?.nodes.some((node) => node.id === nodeId && node.kind === kind));

export const getFirstActionNodeId = (
  workflow: IWorkflowDetailVo | undefined,
  kind: WorkflowActionKind
) => workflow?.nodes.find((node) => node.nodeType === 'action' && node.kind === kind)?.id;

export const getActiveActionNodeId = (
  workflow: IWorkflowDetailVo | undefined,
  selectedNodeId: string | undefined,
  kind: WorkflowActionKind
) => selectedNodeId ?? getFirstActionNodeId(workflow, kind);
