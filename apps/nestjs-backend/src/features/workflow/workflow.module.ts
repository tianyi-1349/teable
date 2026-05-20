import { Module, forwardRef } from '@nestjs/common';
import { CacheModule } from '../../cache/cache.module';
import { AiModule } from '../ai/ai.module';
import { AuthorityMatrixModule } from '../authority-matrix/authority-matrix.module';
import { MailSenderModule } from '../mail-sender/mail-sender.module';
import { RecordOpenApiModule } from '../record/open-api/record-open-api.module';
import { RecordModule } from '../record/record.module';
import { ScriptRuntimeModule } from './script/script-runtime.module';
import { WorkflowAiProvider } from './workflow-ai.provider';
import { workflowAiProviderToken, WorkflowAiService } from './workflow-ai.service';
import { WorkflowCapabilityService } from './workflow-capability.service';
import { WorkflowRunnerService } from './workflow-runner.service';
import { workflowScheduleFacadeToken } from './workflow-schedule.facade';
import { WorkflowScheduleModule } from './workflow-schedule.module';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';

@Module({
  imports: [
    CacheModule,
    forwardRef(() => AiModule),
    AuthorityMatrixModule,
    MailSenderModule.register(),
    RecordModule,
    forwardRef(() => RecordOpenApiModule),
    ScriptRuntimeModule,
    forwardRef(() => WorkflowScheduleModule),
  ],
  controllers: [WorkflowController],
  providers: [
    WorkflowAiProvider,
    { provide: workflowAiProviderToken, useExisting: WorkflowAiProvider },
    { provide: workflowScheduleFacadeToken, useExisting: WorkflowService },
    WorkflowAiService,
    WorkflowCapabilityService,
    WorkflowService,
    WorkflowRunnerService,
  ],
  exports: [
    WorkflowService,
    WorkflowRunnerService,
    WorkflowCapabilityService,
    workflowScheduleFacadeToken,
  ],
})
export class WorkflowModule {}
