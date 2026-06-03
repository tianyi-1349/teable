import { CellValueType, DbFieldType, FieldType, Relationship } from '@teable/core';
import type { PrismaService } from '@teable/db-main-prisma';
import { plainToInstance } from 'class-transformer';
import { mockDeep } from 'vitest-mock-extended';
import type { IDbProvider } from '../../../db-provider/db.provider.interface';
import type { FieldCalculationService } from '../../calculation/field-calculation.service';
import type { TableDomainQueryService } from '../../table-domain/table-domain-query.service';
import { LinkFieldDto } from '../model/field-dto/link-field.dto';
import { SingleLineTextFieldDto } from '../model/field-dto/single-line-text-field.dto';
import { FieldConvertingLinkService } from './field-converting-link.service';
import type { FieldCreatingService } from './field-creating.service';
import type { FieldDeletingService } from './field-deleting.service';
import type { FieldSupplementService } from './field-supplement.service';

describe('FieldConvertingLinkService', () => {
  let service: FieldConvertingLinkService;
  let prismaService: ReturnType<typeof mockDeep<PrismaService>>;

  beforeEach(async () => {
    prismaService = mockDeep<PrismaService>();
    prismaService.txClient.mockReturnValue(prismaService as never);
    service = new FieldConvertingLinkService(
      prismaService,
      mockDeep<FieldDeletingService>(),
      mockDeep<FieldCreatingService>(),
      mockDeep<FieldSupplementService>(),
      mockDeep<FieldCalculationService>(),
      mockDeep<IDbProvider>(),
      mockDeep<TableDomainQueryService>()
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('skips ambiguous foreign records when converting titles to links', async () => {
    const oldField = plainToInstance(SingleLineTextFieldDto, {
      id: 'fld_old',
      name: 'Old',
      type: FieldType.SingleLineText,
      dbFieldType: DbFieldType.Text,
      cellValueType: CellValueType.String,
      isComputed: false,
      options: {},
    });
    const newField = plainToInstance(LinkFieldDto, {
      id: 'fld_old',
      name: 'Old',
      type: FieldType.Link,
      dbFieldType: DbFieldType.Json,
      cellValueType: CellValueType.String,
      isComputed: false,
      isMultipleCellValue: true,
      options: {
        relationship: Relationship.ManyMany,
        foreignTableId: 'tbl_foreign',
        lookupFieldId: 'fld_title',
      },
    });

    vi.spyOn(
      service as unknown as { getRecords: FieldConvertingLinkService['getRecords'] },
      'getRecords'
    ).mockResolvedValueOnce([
      { id: 'rec_source', fields: { fld_old: 'Duplicated, Unique' } },
    ] as never);
    const getRecordsByFieldValueIn = vi
      .spyOn(
        service as unknown as {
          getRecordsByFieldValueIn: FieldConvertingLinkService['getRecordsByFieldValueIn'];
        },
        'getRecordsByFieldValueIn'
      )
      .mockResolvedValueOnce([
        { id: 'rec_foreign_1', fields: { fld_title: 'Duplicated' } },
        { id: 'rec_foreign_2', fields: { fld_title: 'Duplicated' } },
        { id: 'rec_foreign_3', fields: { fld_title: 'Unique' } },
      ] as never);
    prismaService.field.findFirstOrThrow.mockResolvedValueOnce({
      id: 'fld_title',
      name: 'Title',
      type: FieldType.SingleLineText,
      dbFieldType: DbFieldType.Text,
      cellValueType: CellValueType.String,
      isComputed: false,
      options: '{}',
    } as never);

    const opsMap = await service.convertLink('tbl_source', newField, oldField);

    expect(getRecordsByFieldValueIn).toHaveBeenCalledWith(
      'tbl_foreign',
      expect.objectContaining({ id: 'fld_title' }),
      ['Duplicated', 'Unique']
    );
    expect(opsMap.tbl_source.rec_source[0]).toMatchObject({
      p: ['fields', 'fld_old'],
      oi: [{ id: 'rec_foreign_3', title: 'Unique' }],
      od: 'Duplicated, Unique',
    });
  });
});
