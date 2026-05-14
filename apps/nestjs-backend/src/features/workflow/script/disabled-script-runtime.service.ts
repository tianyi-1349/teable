import { Injectable } from '@nestjs/common';
import type { IScriptContext, IScriptRuntime } from './script-runtime.interface';
import { SCRIPT_RUNTIME_DISABLED_MESSAGE } from './script-runtime.interface';

@Injectable()
export class DisabledScriptRuntimeService implements IScriptRuntime {
  async execute(script: string, context: IScriptContext): Promise<unknown> {
    void script;
    void context;

    throw new Error(SCRIPT_RUNTIME_DISABLED_MESSAGE);
  }
}
