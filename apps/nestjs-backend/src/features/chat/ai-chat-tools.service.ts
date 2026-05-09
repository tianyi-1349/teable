import { Injectable } from '@nestjs/common';
import { FieldKeyType } from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import type { ICreateRecordsRo, IGetRecordsRo, IUpdateRecordRo } from '@teable/openapi';
import { tool } from 'ai';
import { z } from 'zod';
import { RecordOpenApiService } from '../record/open-api/record-open-api.service';
import { RecordService } from '../record/record.service';

@Injectable()
export class AiChatToolsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly recordService: RecordService,
    private readonly recordOpenApiService: RecordOpenApiService
  ) {}

  getTools(baseId: string, tableId?: string) {
    return {
      queryRecords: this.createQueryRecordsTool(baseId, tableId),
      createRecords: this.createCreateRecordsTool(baseId, tableId),
      updateRecords: this.createUpdateRecordsTool(baseId, tableId),
      deleteRecords: this.createDeleteRecordsTool(baseId, tableId),
      getTables: this.createGetTablesTool(baseId),
      getFields: this.createGetFieldsTool(baseId, tableId),
    };
  }

  private async resolveTable(baseId: string, tableId?: string) {
    if (!tableId) {
      throw new Error('tableId is required');
    }

    const table = await this.prismaService.tableMeta.findFirst({
      where: { id: tableId, baseId, deletedTime: null },
      select: { id: true, name: true, dbTableName: true },
    });

    if (!table) {
      throw new Error('Table not found in current base');
    }

    return table;
  }

  private createQueryRecordsTool(baseId: string, tableId?: string) {
    return tool({
      description:
        'Query records from a table. Honors Teable view/filter/query semantics through RecordService.',
      inputSchema: z.object({
        tableId: tableId
          ? z.string().optional()
          : z.string().describe('The ID of the table to query'),
        viewId: z.string().optional().describe('Optional view ID used for view-aware querying'),
        filter: z.unknown().optional().describe('Optional Teable filter object'),
        orderBy: z.unknown().optional().describe('Optional Teable orderBy object'),
        search: z.string().optional().describe('Optional search text'),
        take: z.number().min(1).max(100).optional().describe('Number of records to return'),
        skip: z.number().min(0).optional().describe('Number of records to skip'),
      }),
      execute: async ({ tableId: inputTableId, viewId, filter, orderBy, search, take, skip }) => {
        const targetTable = await this.resolveTable(baseId, inputTableId ?? tableId);
        const query: IGetRecordsRo = {
          viewId,
          filter: filter as IGetRecordsRo['filter'],
          orderBy: orderBy as IGetRecordsRo['orderBy'],
          search: search ? [search] : undefined,
          take: Math.min(take ?? 20, 100),
          skip: skip ?? 0,
          fieldKeyType: FieldKeyType.Name,
        };

        return await this.recordService.getRecords(targetTable.id, query, true);
      },
    });
  }

  private createCreateRecordsTool(baseId: string, tableId?: string) {
    return tool({
      description: 'Create records in a table using existing Teable record creation flow.',
      inputSchema: z.object({
        tableId: tableId
          ? z.string().optional()
          : z.string().describe('The ID of the table where records should be created'),
        records: z
          .array(z.record(z.string(), z.unknown()))
          .min(1)
          .max(100)
          .describe('Array of field-value objects using field names'),
      }),
      execute: async ({ tableId: inputTableId, records }) => {
        const targetTable = await this.resolveTable(baseId, inputTableId ?? tableId);
        const createRo: ICreateRecordsRo = {
          records: records.map((fields) => ({ fields })),
          fieldKeyType: FieldKeyType.Name,
        };
        return await this.recordOpenApiService.createRecords(targetTable.id, createRo, true);
      },
    });
  }

  private createUpdateRecordsTool(baseId: string, tableId?: string) {
    return tool({
      description: 'Update existing records in a table using existing Teable record update flow.',
      inputSchema: z.object({
        tableId: tableId
          ? z.string().optional()
          : z.string().describe('The ID of the table containing records to update'),
        recordIds: z.array(z.string()).min(1).max(100).describe('Record IDs to update'),
        fields: z
          .record(z.string(), z.unknown())
          .describe('Field values to update using field names'),
      }),
      execute: async ({ tableId: inputTableId, recordIds, fields }) => {
        const targetTable = await this.resolveTable(baseId, inputTableId ?? tableId);
        const results = [];

        for (const recordId of recordIds) {
          const updateRo: IUpdateRecordRo = {
            record: { fields },
            fieldKeyType: FieldKeyType.Name,
          };
          results.push(
            await this.recordOpenApiService.updateRecord(
              targetTable.id,
              recordId,
              updateRo,
              undefined,
              'true'
            )
          );
        }

        return { updated: results.length, records: results };
      },
    });
  }

  private createDeleteRecordsTool(baseId: string, tableId?: string) {
    return tool({
      description: 'Delete records from a table using existing Teable record deletion flow.',
      inputSchema: z.object({
        tableId: tableId
          ? z.string().optional()
          : z.string().describe('The ID of the table containing records to delete'),
        recordIds: z.array(z.string()).min(1).max(100).describe('Record IDs to delete'),
      }),
      execute: async ({ tableId: inputTableId, recordIds }) => {
        const targetTable = await this.resolveTable(baseId, inputTableId ?? tableId);
        await this.recordOpenApiService.deleteRecords(targetTable.id, recordIds);
        return { deleted: recordIds.length, recordIds };
      },
    });
  }

  private createGetTablesTool(baseId: string) {
    return tool({
      description: 'Get all non-deleted tables in the current base.',
      inputSchema: z.object({}),
      execute: async () => {
        const tables = await this.prismaService.tableMeta.findMany({
          where: { baseId, deletedTime: null },
          select: { id: true, name: true, description: true, icon: true, dbTableName: true },
          orderBy: { order: 'asc' },
        });
        return { tables };
      },
    });
  }

  private createGetFieldsTool(baseId: string, tableId?: string) {
    return tool({
      description: 'Get fields from a table with type and description metadata.',
      inputSchema: z.object({
        tableId: tableId
          ? z.string().optional()
          : z.string().describe('The ID of the table whose fields should be listed'),
      }),
      execute: async ({ tableId: inputTableId }) => {
        const targetTable = await this.resolveTable(baseId, inputTableId ?? tableId);
        const fields = await this.prismaService.field.findMany({
          where: { tableId: targetTable.id, deletedTime: null },
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
            dbFieldName: true,
            options: true,
          },
          orderBy: { order: 'asc' },
        });
        return { fields };
      },
    });
  }
}
