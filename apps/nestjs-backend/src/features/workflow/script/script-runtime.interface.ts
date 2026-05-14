export interface IScriptContext {
  baseId: string;
  input: unknown;
}

export interface IScriptRuntime {
  execute(script: string, context: IScriptContext): Promise<unknown>;
}

export const scriptRuntimeToken = Symbol('SCRIPT_RUNTIME');

export const SCRIPT_RUNTIME_DISABLED_MESSAGE =
  'Run Script workflow actions are disabled until a process-isolated sandbox is available';
