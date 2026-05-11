import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { RecordModule } from '../record/record.module';
import { ScriptRuntimeModule } from './script/script-runtime.module';
import { WorkflowAiProvider } from './workflow-ai.provider';
import { WORKFLOW_AI_PROVIDER, WorkflowAiService } from './workflow-ai.service';
import { WorkflowController } from './workflow.controller';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [AiModule, RecordModule, ScriptRuntimeModule],
  controllers: [WorkflowController],
  providers: [
    WorkflowAiProvider,
    { provide: WORKFLOW_AI_PROVIDER, useExisting: WorkflowAiProvider },
    WorkflowAiService,
    WorkflowService,
    WorkflowRunnerService,
  ],
  exports: [WorkflowService, WorkflowRunnerService],
})
export class WorkflowModule {}
