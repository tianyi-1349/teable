import { Module } from '@nestjs/common';
import { DisabledScriptRuntimeService } from './disabled-script-runtime.service';
import { scriptRuntimeToken } from './script-runtime.interface';
import { ScriptRuntimeService } from './script-runtime.service';

@Module({
  providers: [
    DisabledScriptRuntimeService,
    ScriptRuntimeService,
    { provide: scriptRuntimeToken, useExisting: DisabledScriptRuntimeService },
  ],
  exports: [ScriptRuntimeService],
})
export class ScriptRuntimeModule {}
