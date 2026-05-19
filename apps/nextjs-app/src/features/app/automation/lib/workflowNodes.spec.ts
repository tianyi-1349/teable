import type { IWorkflowDetailVo } from '@teable/openapi';
import { describe, expect, it } from 'vitest';
import { appendActionNode, getRecordTriggerKind, removeActionNode } from './workflowNodes';

describe('workflowNodes', () => {
  const workflow = {
    id: 'wfl123',
    nodes: [
      { id: 'wtr123', workflowId: 'wfl123', nodeType: 'trigger', kind: 'recordCreated' },
      {
        id: 'wac123',
        workflowId: 'wfl123',
        nodeType: 'action',
        kind: 'aiGenerate',
        parentNodeId: 'wtr123',
      },
    ],
  } as IWorkflowDetailVo;

  it('appends an action after the last action node', () => {
    const nodes = appendActionNode(workflow, 'queryRecords');
    const newNode = nodes.find((node) => node.kind === 'queryRecords');

    expect(nodes.find((node) => node.id === 'wac123')?.nextNodeId).toBe(newNode?.id);
    expect(newNode).toMatchObject({
      workflowId: 'wfl123',
      nodeType: 'action',
      parentNodeId: 'wac123',
      config: { tableId: '{{ input.tableId }}', filter: {}, take: 10 },
    });
  });

  it('removes an action and reconnects neighbors', () => {
    const nodes = removeActionNode(
      {
        ...workflow,
        nodes: [
          { id: 'wtr123', workflowId: 'wfl123', nodeType: 'trigger', kind: 'recordCreated' },
          {
            id: 'wac123',
            workflowId: 'wfl123',
            nodeType: 'action',
            kind: 'aiGenerate',
            parentNodeId: 'wtr123',
            nextNodeId: 'wac456',
          },
          {
            id: 'wac456',
            workflowId: 'wfl123',
            nodeType: 'action',
            kind: 'runScript',
            parentNodeId: 'wac123',
          },
        ],
      } as IWorkflowDetailVo,
      'wac123'
    );

    expect(nodes.some((node) => node.id === 'wac123')).toBe(false);
    expect(nodes.find((node) => node.id === 'wtr123')?.nextNodeId).toBe('wac456');
    expect(nodes.find((node) => node.id === 'wac456')?.parentNodeId).toBe('wtr123');
  });

  it('detects recordMatchesConditions trigger kind', () => {
    const triggerKind = getRecordTriggerKind({
      id: 'wfl456',
      nodes: [
        {
          id: 'wtr456',
          workflowId: 'wfl456',
          nodeType: 'trigger',
          kind: 'recordMatchesConditions',
        },
      ],
    } as IWorkflowDetailVo);

    expect(triggerKind).toBe('recordMatchesConditions');
  });

  it('appends loop action with default config', () => {
    const nodes = appendActionNode(workflow, 'loop');
    const loopNode = nodes.find((node) => node.kind === 'loop');

    expect(loopNode).toMatchObject({
      nodeType: 'action',
      config: { itemsPath: '{{ input.items }}', maxIterations: 20 },
    });
  });
});
