import { Module } from '@nestjs/common';
import { AiModule } from '../../ai/ai.module';
import { WORKFLOW_AI_PROVIDER, WorkflowAiService } from '../workflow-ai.service';
import { WorkflowAiProvider } from '../workflow-ai.provider';
import { ScriptRuntimeService } from './script-runtime.service';

@Module({
  imports: [AiModule],
  providers: [
    WorkflowAiProvider,
    { provide: WORKFLOW_AI_PROVIDER, useExisting: WorkflowAiProvider },
    WorkflowAiService,
    ScriptRuntimeService,
  ],
  exports: [WorkflowAiService, ScriptRuntimeService],
})
export class ScriptRuntimeModule {}
