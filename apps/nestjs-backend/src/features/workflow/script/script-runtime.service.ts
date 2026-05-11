import { Injectable } from '@nestjs/common';

interface IScriptContext {
  baseId: string;
  input: unknown;
}

@Injectable()
export class ScriptRuntimeService {
  async execute(script: string, context: IScriptContext): Promise<unknown> {
    void script;
    void context;

    throw new Error(
      'Run Script workflow actions are disabled until a process-isolated sandbox is available'
    );
  }
}
