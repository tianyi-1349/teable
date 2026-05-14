import { Inject, Injectable } from '@nestjs/common';
import {
  IScriptRuntime,
  scriptRuntimeToken,
  type IScriptContext,
} from './script-runtime.interface';

@Injectable()
export class ScriptRuntimeService {
  constructor(@Inject(scriptRuntimeToken) private readonly scriptRuntime: IScriptRuntime) {}

  execute(script: string, context: IScriptContext): Promise<unknown> {
    return this.scriptRuntime.execute(script, context);
  }
}
