import { Module } from '@nestjs/common';
import { DbProvider } from '../../db-provider/db.provider';
import { AttachmentsStorageModule } from '../attachments/attachments-storage.module';
import { CalculationModule } from '../calculation/calculation.module';
import { DataLoaderModule } from '../data-loader/data-loader.module';
import { TableIndexService } from '../table/table-index.service';
import { RecordQueryBuilderModule } from './query-builder';
import { RecordPermissionService } from './record-permission.service';
import { RecordQueryModule } from './record-query.module';
import { RecordService } from './record.service';
import { UserNameListener } from './user-name.listener.service';

@Module({
  imports: [
    CalculationModule,
    AttachmentsStorageModule,
    DataLoaderModule,
    RecordQueryModule,
    RecordQueryBuilderModule,
  ],
  providers: [
    UserNameListener,
    RecordService,
    DbProvider,
    TableIndexService,
    RecordPermissionService,
  ],
  exports: [RecordService, RecordQueryModule, RecordPermissionService],
})
export class RecordModule {}
