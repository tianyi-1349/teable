/* eslint-disable sonarjs/no-duplicate-string */
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CellValueType, DbFieldType, FieldType, OpName } from '@teable/core';
import type { IFieldVo, INumberFormatting, ISetFieldPropertyOpContext } from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import type { Knex } from 'knex';
import { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import { DB_PROVIDER_SYMBOL } from '../../db-provider/db.provider';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import { BatchService } from '../calculation/batch.service';
import { DataLoaderService } from '../data-loader/data-loader.service';
import { TableDomainQueryService } from '../table-domain/table-domain-query.service';
import { FormulaFieldService } from './field-calculate/formula-field.service';
import { LinkFieldQueryService } from './field-calculate/link-field-query.service';
import { FieldService } from './field.service';
import { applyFieldPropertyOpsAndCreateInstance } from './model/factory';

describe('FieldService', () => {
  let service: FieldService;
  const prismaService = mockDeep<PrismaService>();
  const batchService = mockDeep<BatchService>();
  const dataLoaderService = mockDeep<DataLoaderService>();
  const clsService = mockDeep<ClsService>();
  const dbProvider = mockDeep<IDbProvider>();
  const knex = {} as Knex;
  const formulaFieldService = mockDeep<FormulaFieldService>();
  const linkFieldQueryService = mockDeep<LinkFieldQueryService>();
  const tableDomainQueryService = mockDeep<TableDomainQueryService>();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldService,
        {
          provide: BatchService,
          useValue: batchService,
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: DataLoaderService,
          useValue: dataLoaderService,
        },
        {
          provide: ClsService,
          useValue: clsService,
        },
        {
          provide: DB_PROVIDER_SYMBOL,
          useValue: dbProvider,
        },
        {
          provide: 'CUSTOM_KNEX',
          useValue: knex,
        },
        {
          provide: FormulaFieldService,
          useValue: formulaFieldService,
        },
        {
          provide: LinkFieldQueryService,
          useValue: linkFieldQueryService,
        },
        {
          provide: TableDomainQueryService,
          useValue: tableDomainQueryService,
        },
      ],
    }).compile();

    service = module.get<FieldService>(FieldService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('applyFieldPropertyOpsAndCreateInstance', () => {
    it('should apply field property operations and return field instance', () => {
      // Create a mock field VO
      const mockFieldVo: IFieldVo = {
        id: 'fld123',
        name: 'Original Name',
        type: FieldType.SingleLineText,
        dbFieldName: 'fld_original',
        cellValueType: CellValueType.String,
        dbFieldType: DbFieldType.Text,
        options: {},
      };

      // Create mock operations
      const ops: ISetFieldPropertyOpContext[] = [
        {
          name: OpName.SetFieldProperty,
          key: 'name',
          newValue: 'Updated Name',
          oldValue: 'Original Name',
        },
        {
          name: OpName.SetFieldProperty,
          key: 'description',
          newValue: 'New description',
          oldValue: undefined,
        },
      ];

      // Apply operations
      const result = applyFieldPropertyOpsAndCreateInstance(mockFieldVo, ops);

      // Verify the result is a field instance
      expect(result).toBeDefined();
      expect(result.id).toBe('fld123');
      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('New description');
      expect(result.type).toBe(FieldType.SingleLineText);

      // Verify original field VO is not modified
      expect(mockFieldVo.name).toBe('Original Name');
      expect(mockFieldVo.description).toBeUndefined();
    });

    it('should handle empty operations array', () => {
      const mockFieldVo: IFieldVo = {
        id: 'fld123',
        name: 'Test Field',
        type: FieldType.Number,
        dbFieldName: 'fld_test',
        cellValueType: CellValueType.Number,
        dbFieldType: DbFieldType.Real,
        options: {
          formatting: {
            type: 'decimal',
            precision: 2,
          } as INumberFormatting,
        },
      };

      const result = applyFieldPropertyOpsAndCreateInstance(mockFieldVo, []);

      expect(result).toBeDefined();
      expect(result.id).toBe('fld123');
      expect(result.name).toBe('Test Field');
      expect(result.type).toBe(FieldType.Number);
    });
  });
});
