import { Module, forwardRef } from '@nestjs/common';
import { RecordOpenApiModule } from '../record/open-api/record-open-api.module';
import { RecordModule } from '../record/record.module';
import { SettingModule } from '../setting/setting.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [SettingModule, RecordModule, forwardRef(() => RecordOpenApiModule)],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
