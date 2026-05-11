import { Module } from '@nestjs/common';
import { ScriptRuntimeService } from './script-runtime.service';

@Module({
  providers: [ScriptRuntimeService],
  exports: [ScriptRuntimeService],
})
export class ScriptRuntimeModule {}
