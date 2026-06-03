import { Module } from '@nestjs/common';
import { DbProvider } from '../../db-provider/db.provider';
import { DataLoaderModule } from '../data-loader/data-loader.module';
import { RecordQueryBuilderModule } from './query-builder';
import { RecordQueryService } from './record-query.service';

@Module({
  imports: [DataLoaderModule, RecordQueryBuilderModule],
  providers: [DbProvider, RecordQueryService],
  exports: [RecordQueryService],
})
export class RecordQueryModule {}
