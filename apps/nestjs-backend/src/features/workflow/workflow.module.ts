import { Module } from '@nestjs/common';
import { DbProvider } from '../../db-provider/db.provider';
import { AiModule } from '../ai/ai.module';
import { RecordOpenApiModule } from '../record/open-api/record-open-api.module';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowRuntimeListener } from './workflow-runtime.listener';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [AiModule, RecordOpenApiModule],
  controllers: [WorkflowController],
  providers: [WorkflowService, WorkflowExecutionService, WorkflowRuntimeListener, DbProvider],
  exports: [WorkflowService, WorkflowExecutionService],
})
export class WorkflowModule {}
