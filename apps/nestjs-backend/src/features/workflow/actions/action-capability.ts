import type { IWorkflowActionCapability } from './action-definition';

const workflowActionCapabilities: IWorkflowActionCapability[] = [
  { kind: 'queryRecords', configurable: true, runnable: true },
  { kind: 'createRecords', configurable: true, runnable: true },
  { kind: 'updateRecords', configurable: true, runnable: true },
  { kind: 'sendEmail', configurable: true, runnable: true },
  { kind: 'httpRequest', configurable: true, runnable: true },
  { kind: 'condition', configurable: true, runnable: true },
  { kind: 'loop', configurable: true, runnable: true },
  { kind: 'aiGenerate', configurable: true, runnable: true },
  { kind: 'runScript', configurable: true, runnable: true },
];

export const getWorkflowActionCapabilities = () => workflowActionCapabilities;

export const getWorkflowActionCapability = (kind: string) =>
  workflowActionCapabilities.find((capability) => capability.kind === kind);
