export interface IWorkflowActionCapability {
  kind: string;
  configurable: boolean;
  runnable: boolean;
  reason?: 'requiresSandbox' | 'notImplemented' | 'missingPermission';
}
