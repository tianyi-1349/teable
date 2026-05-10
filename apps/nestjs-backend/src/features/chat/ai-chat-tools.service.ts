import { Injectable } from '@nestjs/common';
import { FieldKeyType, type Action } from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import type { ICreateRecordsRo, IGetRecordsRo, IUpdateRecordRo } from '@teable/openapi';
import { tool } from 'ai';
import { ClsService } from 'nestjs-cls';
import { z } from 'zod';
import type { IClsStore } from '../../types/cls';
import { PermissionService } from '../auth/permission.service';
import { RecordOpenApiService } from '../record/open-api/record-open-api.service';
import { RecordService } from '../record/record.service';

const filterOperatorSchema = z.enum([
  'is',
  'isNot',
  'contains',
  'doesNotContain',
  'isEmpty',
  'isNotEmpty',
  'isGreater',
  'isGreaterEqual',
  'isLess',
  'isLessEqual',
  'isAnyOf',
  'isNoneOf',
  'hasAnyOf',
  'hasAllOf',
  'isNotExactly',
  'hasNoneOf',
  'isExactly',
  'isWithIn',
  'isBefore',
  'isAfter',
  'isOnOrBefore',
  'isOnOrAfter',
]);

const combinedFilterSchema = z
  .union([
    z.object({
      conjunction: z.enum(['and', 'or']).optional(),
      filterSet: z.array(
        z.object({
          fieldId: z.string().optional(),
          operator: filterOperatorSchema.optional(),
          value: z.unknown().optional(),
        })
      ),
    }),
    z.object({
      fieldId: z.string(),
      operator: filterOperatorSchema,
      value: z.unknown().optional(),
    }),
  ])
  .optional()
  .describe('Optional Teable filter object (conjunction + filterSet or single filter)');

const orderBySchema = z
  .array(
    z.object({
      fieldId: z.string(),
      order: z.enum(['asc', 'desc']).optional(),
    })
  )
  .optional()
  .describe('Optional orderBy array with fieldId and order direction');

@Injectable()
export class AiChatToolsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly recordService: RecordService,
    private readonly recordOpenApiService: RecordOpenApiService,
    private readonly permissionService: PermissionService,
    private readonly cls: ClsService<IClsStore>
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

  private async checkPermission(resourceId: string, action: Action): Promise<void> {
    const accessTokenId = this.cls.get('accessTokenId');
    await this.permissionService.validPermissions(resourceId, [action], accessTokenId);
  }

  private async resolveTable(baseId: string, tableId?: string) {
    if (!tableId) {
      throw new Error('tableId is required');
    }

    const table = await this.prismaService.tableMeta.findFirst({
      where: { id: tableId, baseId, deletedTime: null },
      select: { id: true, name: true },
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
        filter: combinedFilterSchema,
        orderBy: orderBySchema,
        search: z.string().optional().describe('Optional search text'),
        take: z.number().min(1).max(100).optional().describe('Number of records to return'),
        skip: z.number().min(0).optional().describe('Number of records to skip'),
      }),
      execute: async ({ tableId: inputTableId, viewId, filter, orderBy, search, take, skip }) => {
        const targetTable = await this.resolveTable(baseId, inputTableId ?? tableId);
        await this.checkPermission(targetTable.id, 'record|read');

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
        await this.checkPermission(targetTable.id, 'record|create');

        const createRo: ICreateRecordsRo = {
          records: records.map((fields) => ({ fields })),
          fieldKeyType: FieldKeyType.Name,
        };
        return await this.recordOpenApiService.createRecords(targetTable.id, createRo);
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
        await this.checkPermission(targetTable.id, 'record|update');

        const results = [];
        for (const recordId of recordIds) {
          const updateRo: IUpdateRecordRo = {
            record: { fields },
            fieldKeyType: FieldKeyType.Name,
          };
          results.push(
            await this.recordOpenApiService.updateRecord(targetTable.id, recordId, updateRo)
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
        await this.checkPermission(targetTable.id, 'record|delete');

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
        await this.checkPermission(baseId, 'base|read');

        const tables = await this.prismaService.tableMeta.findMany({
          where: { baseId, deletedTime: null },
          select: { id: true, name: true, description: true, icon: true },
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
        await this.checkPermission(targetTable.id, 'record|read');

        const fields = await this.prismaService.field.findMany({
          where: { tableId: targetTable.id, deletedTime: null },
          select: {
            id: true,
            name: true,
            type: true,
            description: true,
          },
          orderBy: { order: 'asc' },
        });
        return { fields };
      },
    });
  }
}
