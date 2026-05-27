import { PrismaService } from '@teable/db-main-prisma';
import { mockDeep } from 'vitest-mock-extended';
import type { IDbProvider } from '../../../db-provider/db.provider.interface';
import { FieldCalculationService } from '../../calculation/field-calculation.service';
import { TableDomainQueryService } from '../../table-domain/table-domain-query.service';
import { FieldConvertingLinkService } from './field-converting-link.service';
import { FieldCreatingService } from './field-creating.service';
import { FieldDeletingService } from './field-deleting.service';
import { FieldSupplementService } from './field-supplement.service';

describe('FieldConvertingLinkService', () => {
  let service: FieldConvertingLinkService;

  beforeEach(async () => {
    service = new FieldConvertingLinkService(
      mockDeep<PrismaService>(),
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
});
