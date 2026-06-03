import type { PrismaService } from '@teable/db-main-prisma';
import type { Knex } from 'knex';
import type { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import type { IClsStore } from '../../types/cls';
import type { BatchService } from '../calculation/batch.service';
import { TableService } from './table.service';

describe('TableService', () => {
  let service: TableService;

  beforeEach(async () => {
    service = new TableService(
      mockDeep<ClsService<IClsStore>>(),
      mockDeep<PrismaService>(),
      mockDeep<BatchService>(),
      mockDeep<IDbProvider>(),
      {} as Knex
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should convert table name to valid db table name', () => {
    const dbTableName = service.generateValidName('!@#$1_a ha3ha 中文');
    expect(dbTableName).toBe('t1_a_ha3ha_Zhong_Wen');
  });

  it('should limit table name to 40', () => {
    const dbTableName = service.generateValidName('t'.repeat(50));
    expect(dbTableName).toBe('t'.repeat(40));
  });

  it('should convert chinese to pin yin', () => {
    const dbTableName = service.generateValidName('中文');
    expect(dbTableName).toBe('Zhong_Wen');
  });

  it('should convert empty table name unnamed', () => {
    const dbTableName = service.generateValidName('');
    expect(dbTableName).toBe('unnamed');
  });
});
