import { Injectable, Logger } from '@nestjs/common';
import {
  CellFormat,
  CellValueType,
  DbFieldType,
  FieldType,
  FieldKeyType,
  HttpErrorCode,
  type ISnapshotBase,
  TableDomain,
  type IGridColumnMeta,
  type IRecord,
} from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import { DEFAULT_MAX_SEARCH_FIELD_COUNT } from '@teable/openapi';
import { Knex } from 'knex';
import { get, orderBy, toNumber, uniqBy } from 'lodash';
import { InjectModel } from 'nest-knexjs';
import { CustomHttpException } from '../../custom.exception';
import { InjectDbProvider } from '../../db-provider/db.provider';
import { IDbProvider } from '../../db-provider/db.provider.interface';
import { Timing } from '../../utils/timing';
import { DataLoaderService } from '../data-loader/data-loader.service';
import type { IVisualTableDefaultField } from '../field/constant';
import type { IFieldInstance } from '../field/model/factory';
import { createFieldInstanceByRaw, fieldCore2FieldInstance } from '../field/model/factory';
import { ROW_ORDER_FIELD_PREFIX } from '../view/constant';
import { InjectRecordQueryBuilder, IRecordQueryBuilder } from './query-builder';
import { assertAllRecordIdsFound, buildSnapshotsFromDbRecords } from './record-snapshot-mapping';

/**
 * Service for querying record data
 * This service is separated from RecordService to avoid circular dependencies
 */
@Injectable()
export class RecordQueryService {
  private readonly logger = new Logger(RecordQueryService.name);

  constructor(
    private readonly prismaService: PrismaService,
    @InjectModel('CUSTOM_KNEX') private readonly knex: Knex,
    @InjectDbProvider() private readonly dbProvider: IDbProvider,
    private readonly dataLoaderService: DataLoaderService,
    @InjectRecordQueryBuilder() private readonly recordQueryBuilder: IRecordQueryBuilder
  ) {}

  /**
   * Get the database column name to query for a field
   * For lookup formula fields, use the standard field name
   */
  private getQueryColumnName(field: IFieldInstance): string {
    return field.dbFieldName;
  }

  private dbRecord2RecordFields(record: IRecord['fields'], fields: IFieldInstance[]) {
    return fields.reduce<IRecord['fields']>((acc, field) => {
      const fieldId = field[FieldKeyType.Id];
      const dbCellValue = record[this.getQueryColumnName(field)];
      const cellValue = field.convertDBValue2CellValue(dbCellValue);
      if (cellValue != null) {
        acc[fieldId] = cellValue;
      }
      return acc;
    }, {});
  }

  async getDbTableName(tableId: string) {
    const tableMeta = await this.prismaService
      .txClient()
      .tableMeta.findUniqueOrThrow({
        where: { id: tableId },
        select: { dbTableName: true },
      })
      .catch(() => {
        throw new CustomHttpException('Table not found', HttpErrorCode.NOT_FOUND, {
          localization: {
            i18nKey: 'httpErrors.table.notFound',
          },
        });
      });
    return tableMeta.dbTableName;
  }

  private async getPrimaryField(tableId: string) {
    const field = await this.prismaService.txClient().field.findFirst({
      where: { tableId, isPrimary: true, deletedTime: null },
    });

    if (!field) {
      throw new CustomHttpException(
        `Could not find primary field in table ${tableId}`,
        HttpErrorCode.NOT_FOUND,
        {
          localization: {
            i18nKey: 'httpErrors.table.notFoundPrimaryField',
          },
        }
      );
    }

    return createFieldInstanceByRaw(field);
  }

  async getAllRecordCount(dbTableName: string) {
    const sqlNative = this.knex(dbTableName).count({ count: '*' }).toSQL().toNative();

    const queryResult = await this.prismaService
      .txClient()
      .$queryRawUnsafe<{ count?: number }[]>(sqlNative.sql, ...sqlNative.bindings);
    return Number(queryResult[0]?.count ?? 0);
  }

  async getMaxRecordOrder(dbTableName: string) {
    const sqlNative = this.knex(dbTableName).max('__auto_number', { as: 'max' }).toSQL().toNative();

    const result = await this.prismaService
      .txClient()
      .$queryRawUnsafe<{ max?: number }[]>(sqlNative.sql, ...sqlNative.bindings);

    return Number(result[0]?.max ?? 0) + 1;
  }

  async getBasicOrderIndexField(dbTableName: string, viewId: string | undefined) {
    if (!viewId) {
      return '__auto_number';
    }
    const columnName = `${ROW_ORDER_FIELD_PREFIX}_${viewId}`;
    const exists = await this.dbProvider.checkColumnExist(
      dbTableName,
      columnName,
      this.prismaService.txClient()
    );

    if (exists) {
      return columnName;
    }
    return '__auto_number';
  }

  private async getViewIndexColumns(dbTableName: string) {
    const columnInfoQuery = this.dbProvider.columnInfo(dbTableName);
    const columns = await this.prismaService
      .txClient()
      .$queryRawUnsafe<{ name: string }[]>(columnInfoQuery);
    return columns
      .filter((column) => column.name.startsWith(ROW_ORDER_FIELD_PREFIX))
      .map((column) => column.name);
  }

  async getAllViewIndexesField(dbTableName: string) {
    const viewIndexColumns = await this.getViewIndexColumns(dbTableName);
    return viewIndexColumns.reduce<{ [viewId: string]: string }>((acc, cur) => {
      const viewId = cur.substring(ROW_ORDER_FIELD_PREFIX.length + 1);
      acc[viewId] = cur;
      return acc;
    }, {});
  }

  async getViewIndexFields(dbTableName: string) {
    return this.getViewIndexColumns(dbTableName);
  }

  @Timing()
  async getRecordIndexes(
    table: TableDomain,
    recordIds: string[],
    viewId?: string
  ): Promise<Record<string, number>[] | undefined> {
    const dbTableName = table.dbTableName;
    const allViewIndexColumns = await this.getViewIndexColumns(dbTableName);
    const viewIndexColumns = viewId
      ? (() => {
          const viewIndexColumns = allViewIndexColumns.filter((column) => column.endsWith(viewId));
          return viewIndexColumns.length === 0 ? ['__auto_number'] : viewIndexColumns;
        })()
      : allViewIndexColumns;

    if (!viewIndexColumns.length) {
      return;
    }

    const indexQuery = this.knex(dbTableName)
      .select(
        viewIndexColumns.reduce<Record<string, string>>((acc, columnName) => {
          if (columnName === '__auto_number') {
            acc[viewId as string] = '__auto_number';
            return acc;
          }
          const theViewId = columnName.substring(ROW_ORDER_FIELD_PREFIX.length + 1);
          acc[theViewId] = columnName;
          return acc;
        }, {})
      )
      .select('__id')
      .whereIn('__id', recordIds)
      .toQuery();
    const indexValues = await this.prismaService
      .txClient()
      .$queryRawUnsafe<Record<string, number>[]>(indexQuery);

    const indexMap = indexValues.reduce<Record<string, Record<string, number>>>((map, cur) => {
      const id = cur.__id;
      delete cur.__id;
      map[id] = cur;
      return map;
    }, {});

    return recordIds.map((recordId) => indexMap[recordId]);
  }

  async getSearchFields(
    originFieldInstanceMap: Record<string, IFieldInstance>,
    search?: [string, string?, boolean?],
    viewId?: string,
    projection?: string[]
  ) {
    const maxSearchFieldCount = process.env.MAX_SEARCH_FIELD_COUNT
      ? toNumber(process.env.MAX_SEARCH_FIELD_COUNT)
      : DEFAULT_MAX_SEARCH_FIELD_COUNT;
    let viewColumnMeta: IGridColumnMeta | null = null;
    const fieldInstanceMap = projection?.length === 0 ? {} : { ...originFieldInstanceMap };
    if (!search) {
      return [] as IFieldInstance[];
    }

    const isSearchAllFields = !search?.[1];

    if (viewId) {
      const { columnMeta: viewColumnRawMeta } =
        (await this.prismaService.view.findUnique({
          where: { id: viewId, deletedTime: null },
          select: { columnMeta: true },
        })) || {};

      viewColumnMeta = viewColumnRawMeta ? JSON.parse(viewColumnRawMeta) : null;

      if (viewColumnMeta) {
        Object.entries(viewColumnMeta).forEach(([key, value]) => {
          if (get(value, ['hidden'])) {
            delete fieldInstanceMap[key];
          }
        });
      }
    }

    if (projection?.length) {
      Object.keys(fieldInstanceMap).forEach((fieldId) => {
        if (!projection.includes(fieldId)) {
          delete fieldInstanceMap[fieldId];
        }
      });
    }

    return uniqBy(
      orderBy(
        Object.values(fieldInstanceMap)
          .map((field) => ({
            ...field,
            isStructuredCellValue: field.isStructuredCellValue,
          }))
          .filter((field) => {
            if (!viewColumnMeta) {
              return true;
            }
            return !viewColumnMeta?.[field.id]?.hidden;
          })
          .filter((field) => {
            if (!projection) {
              return true;
            }
            return projection.includes(field.id);
          })
          .filter((field) => {
            if (isSearchAllFields) {
              return true;
            }

            const searchArr = search?.[1]?.split(',') || [];
            return searchArr.includes(field.id);
          })
          .filter((field) => {
            if (field.type === FieldType.Button) {
              return false;
            }
            if (field.cellValueType === CellValueType.Boolean) {
              return false;
            }
            if (
              isSearchAllFields &&
              field.cellValueType === CellValueType.Number &&
              isNaN(Number(search[0]))
            ) {
              return false;
            }
            return true;
          })
          .map((field) => {
            return {
              ...field,
              order: viewColumnMeta?.[field.id]?.order ?? Number.MIN_SAFE_INTEGER,
            };
          }),
        ['order', 'createTime']
      ),
      'id'
    ).slice(0, maxSearchFieldCount) as unknown as IFieldInstance[];
  }

  async getFieldsByProjection(
    tableId: string,
    projection?: { [fieldNameOrId: string]: boolean },
    fieldKeyType: FieldKeyType = FieldKeyType.Id
  ) {
    let fields = await this.dataLoaderService.field.load(tableId);
    if (projection) {
      const projectionFieldKeys = Object.entries(projection)
        .filter(([, v]) => v)
        .map(([k]) => k);
      if (projectionFieldKeys.length) {
        fields = fields.filter((field) => projectionFieldKeys.includes(field[fieldKeyType]));
      }
    }

    return fields.map((field) => createFieldInstanceByRaw(field));
  }

  /**
   * Get record snapshots in bulk by record IDs
   * This is a simplified version of RecordService.getSnapshotBulk for internal use
   */
  @Timing()
  async getSnapshotBulk(
    table: TableDomain,
    recordIds: string[]
  ): Promise<ISnapshotBase<IRecord>[]> {
    if (recordIds.length === 0) {
      return [];
    }

    try {
      const { qb: queryBuilder } = await this.recordQueryBuilder.createRecordQueryBuilder(
        table.dbTableName,
        {
          tableId: table.id,
          viewId: undefined,
          useQueryModel: true,
          restrictRecordIds: recordIds,
        }
      );
      const sql = queryBuilder.whereIn('__id', recordIds).toQuery();

      this.logger.debug(`Querying records: ${sql}`);

      const rawRecords = await this.prismaService
        .txClient()
        .$queryRawUnsafe<({ [key: string]: unknown } & IVisualTableDefaultField)[]>(sql);

      const fields = table.fieldList.map((f) => fieldCore2FieldInstance(f));
      const recordIdsMap = recordIds.reduce<Record<string, number>>((acc, recordId, index) => {
        acc[recordId] = index;
        return acc;
      }, {});
      const missingRecordIds = assertAllRecordIdsFound(recordIds, rawRecords);
      if (missingRecordIds.length) {
        throw new CustomHttpException(
          `Some records cannot be found, ids: ${missingRecordIds.join(', ')}`,
          HttpErrorCode.NOT_FOUND,
          {
            localization: {
              i18nKey: 'httpErrors.record.notFound',
            },
          }
        );
      }

      const primaryField = await this.getPrimaryField(table.id);

      return buildSnapshotsFromDbRecords(
        rawRecords,
        recordIdsMap,
        primaryField,
        FieldKeyType.Id,
        CellFormat.Json,
        (record) => this.dbRecord2RecordFields(record, fields)
      );
    } catch (error) {
      this.logger.error(`Failed to get snapshots for table ${table.id}: ${error}`);
      throw error;
    }
  }

  async getRecordsHeadWithTitles(tableId: string, titles: string[]) {
    const dbTableName = await this.getDbTableName(tableId);
    const field = await this.getPrimaryField(tableId);

    if (field.dbFieldType !== DbFieldType.Text) {
      return [];
    }

    const queryBuilder = this.knex(dbTableName)
      .select({ title: field.dbFieldName, id: '__id' })
      .whereIn(field.dbFieldName, titles);

    const querySql = queryBuilder.toQuery();

    return this.prismaService.txClient().$queryRawUnsafe<{ id: string; title: string }[]>(querySql);
  }

  async getRecordsHeadWithIds(tableId: string, recordIds: string[]) {
    const dbTableName = await this.getDbTableName(tableId);
    const field = await this.getPrimaryField(tableId);

    const queryBuilder = this.knex(dbTableName)
      .select({ title: field.dbFieldName, id: '__id' })
      .whereIn('__id', recordIds);

    const querySql = queryBuilder.toQuery();

    const result = await this.prismaService
      .txClient()
      .$queryRawUnsafe<{ id: string; title: unknown }[]>(querySql);

    return result.map((r) => ({
      id: r.id,
      title: field.cellValue2String(r.title),
    }));
  }

  async hasRecord(tableId: string, recordId: string): Promise<boolean> {
    const dbTableName = await this.getDbTableName(tableId);
    const queryBuilder = this.knex(dbTableName).select('__id').where('__id', recordId).limit(1);

    const result = await this.prismaService
      .txClient()
      .$queryRawUnsafe<{ __id: string }[]>(queryBuilder.toQuery());

    return result.length > 0;
  }
}
