import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AuthorityMatrixModule } from '../authority-matrix/authority-matrix.module';
import { RecordModule } from '../record/record.module';
import { ScriptRuntimeModule } from './script/script-runtime.module';
import { WorkflowAiProvider } from './workflow-ai.provider';
import { WORKFLOW_AI_PROVIDER, WorkflowAiService } from './workflow-ai.service';
import { WorkflowCapabilityService } from './workflow-capability.service';
import { WorkflowRunnerService } from './workflow-runner.service';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [AiModule, AuthorityMatrixModule, RecordModule, ScriptRuntimeModule],
  controllers: [WorkflowController],
  providers: [
    WorkflowAiProvider,
    { provide: WORKFLOW_AI_PROVIDER, useExisting: WorkflowAiProvider },
    WorkflowAiService,
    WorkflowCapabilityService,
    WorkflowService,
    WorkflowRunnerService,
  ],
  exports: [WorkflowService, WorkflowRunnerService, WorkflowCapabilityService],
})
export class WorkflowModule {}
