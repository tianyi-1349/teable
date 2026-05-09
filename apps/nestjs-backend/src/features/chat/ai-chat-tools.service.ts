import { Injectable, Logger } from '@nestjs/common';
import type { PrismaService } from '@teable/db-main-prisma';
import type { IToolDefinition, IToolCallResult } from '../chat/chat.types';

@Injectable()
export class AiChatToolsService {
  private readonly logger = new Logger(AiChatToolsService.name);

  constructor(private readonly prismaService: PrismaService) {}

  getTools(baseId: string, tableId?: string): IToolDefinition[] {
    return [
      this.createQueryRecordsTool(baseId, tableId),
      this.createUpdateRecordsTool(baseId, tableId),
      this.createDeleteRecordsTool(baseId, tableId),
      this.createGetRecordsTool(baseId, tableId),
      this.createGetTablesTool(baseId),
      this.createGetFieldsTool(baseId, tableId),
    ];
  }

  async executeTool(
    tools: IToolDefinition[],
    toolName: string,
    args: Record<string, unknown>
  ): Promise<IToolCallResult> {
    const tool = tools.find((t) => t.name === toolName);
    if (!tool) {
      return {
        toolCallId: '',
        toolName,
        result: null,
        error: `Tool "${toolName}" not found`,
      };
    }

    try {
      const result = await tool.execute(args);
      return {
        toolCallId: '',
        toolName,
        result,
      };
    } catch (error) {
      this.logger.error(`Tool execution failed: ${toolName}`, error);
      return {
        toolCallId: '',
        toolName,
        result: null,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // ===== Tool Definitions =====

  private createQueryRecordsTool(baseId: string, tableId?: string): IToolDefinition {
    return {
      name: 'queryRecords',
      description: 'Query records from a table. Use this to read/search data.',
      parameters: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
            description: tableId ? undefined : 'The ID of the table to query',
          },
          filter: {
            type: 'object',
            description: 'Filter conditions (optional)',
          },
          orderBy: {
            type: 'array',
            description: 'Sort order (optional)',
          },
          take: {
            type: 'number',
            description: 'Number of records to return (default: 20, max: 100)',
          },
          skip: {
            type: 'number',
            description: 'Number of records to skip (for pagination)',
          },
        },
        required: tableId ? [] : ['tableId'],
      },
      execute: async (args) => {
        const targetTableId = args.tableId as string | undefined || tableId;
        if (!targetTableId) {
          throw new Error('tableId is required');
        }
        const take = Math.min((args.take as number) || 20, 100);
        const skip = (args.skip as number) || 0;

        const records = await this.prismaService.$queryRaw`
          SELECT * FROM table_records
          WHERE table_id = ${targetTableId} AND base_id = ${baseId} AND deleted_time IS NULL
          ORDER BY created_time DESC
          LIMIT ${take} OFFSET ${skip}
        `;

        return { records, total: records.length };
      },
    };
  }

  private createUpdateRecordsTool(baseId: string, tableId?: string): IToolDefinition {
    return {
      name: 'updateRecords',
      description: 'Update existing records in a table.',
      parameters: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
            description: tableId ? undefined : 'The ID of the table',
          },
          recordIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs of records to update',
          },
          fields: {
            type: 'object',
            description: 'Field values to update',
          },
        },
        required: tableId ? ['recordIds', 'fields'] : ['tableId', 'recordIds', 'fields'],
      },
      execute: async (args) => {
        const targetTableId = args.tableId as string | undefined || tableId;
        if (!targetTableId) {
          throw new Error('tableId is required');
        }
        const recordIds = args.recordIds as string[];
        const fields = args.fields as Record<string, unknown>;

        await this.prismaService.$executeRaw`
          UPDATE table_records
          SET fields = ${JSON.stringify(fields)}, updated_time = NOW()
          WHERE table_id = ${targetTableId} AND id IN (${recordIds.join(',')})
        `;

        return { updated: recordIds.length, recordIds };
      },
    };
  }

  private createDeleteRecordsTool(baseId: string, tableId?: string): IToolDefinition {
    return {
      name: 'deleteRecords',
      description: 'Delete records from a table.',
      parameters: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
            description: tableId ? undefined : 'The ID of the table',
          },
          recordIds: {
            type: 'array',
            items: { type: 'string' },
            description: 'IDs of records to delete',
          },
        },
        required: tableId ? ['recordIds'] : ['tableId', 'recordIds'],
      },
      execute: async (args) => {
        const targetTableId = args.tableId as string | undefined || tableId;
        if (!targetTableId) {
          throw new Error('tableId is required');
        }
        const recordIds = args.recordIds as string[];

        await this.prismaService.$executeRaw`
          UPDATE table_records
          SET deleted_time = NOW()
          WHERE table_id = ${targetTableId} AND id IN (${recordIds.join(',')})
        `;

        return { deleted: recordIds.length, recordIds };
      },
    };
  }

  private createGetRecordsTool(baseId: string, tableId?: string): IToolDefinition {
    return {
      name: 'createRecords',
      description: 'Create new records in a table.',
      parameters: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
            description: tableId ? undefined : 'The ID of the table',
          },
          records: {
            type: 'array',
            items: {
              type: 'object',
              description: 'Record fields to create',
            },
            description: 'Array of record data to create',
          },
        },
        required: tableId ? ['records'] : ['tableId', 'records'],
      },
      execute: async (args) => {
        const targetTableId = args.tableId as string | undefined || tableId;
        if (!targetTableId) {
          throw new Error('tableId is required');
        }
        const records = args.records as Array<Record<string, unknown>>;

        const createdIds: string[] = [];
        for (const recordData of records) {
          const result = await this.prismaService.$queryRaw`
            INSERT INTO table_records (id, table_id, base_id, fields, created_time)
            VALUES (gen_random_uuid(), ${targetTableId}, ${baseId}, ${JSON.stringify(recordData)}, NOW())
            RETURNING id
          `;
          if (result.length > 0) {
            createdIds.push(result[0].id);
          }
        }

        return { created: createdIds.length, recordIds: createdIds };
      },
    };
  }

  private createGetTablesTool(baseId: string): IToolDefinition {
    return {
      name: 'getTables',
      description: 'Get all tables in the current base.',
      parameters: {
        type: 'object',
        properties: {},
      },
      execute: async () => {
        const tables = await this.prismaService.$queryRaw`
          SELECT id, name, description, icon
          FROM table_meta
          WHERE base_id = ${baseId} AND deleted_time IS NULL
          ORDER BY "order"
        `;

        return { tables };
      },
    };
  }

  private createGetFieldsTool(baseId: string, tableId?: string): IToolDefinition {
    return {
      name: 'getFields',
      description: 'Get all fields in a table.',
      parameters: {
        type: 'object',
        properties: {
          tableId: {
            type: 'string',
            description: tableId ? undefined : 'The ID of the table',
          },
        },
        required: tableId ? [] : ['tableId'],
      },
      execute: async (args) => {
        const targetTableId = args.tableId as string | undefined || tableId;
        if (!targetTableId) {
          throw new Error('tableId is required');
        }

        const fields = await this.prismaService.$queryRaw`
          SELECT id, name, type, db_field_name, description, options
          FROM field
          WHERE table_id = ${targetTableId} AND deleted_time IS NULL
          ORDER BY "order"
        `;

        return { fields };
      },
    };
  }
}
