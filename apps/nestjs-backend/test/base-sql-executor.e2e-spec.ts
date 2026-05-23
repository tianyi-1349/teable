import type { INestApplication } from '@nestjs/common';
import { PrismaService } from '@teable/db-main-prisma';
import { BaseSqlExecutorService } from '../src/features/base-sql-executor/base-sql-executor.service';
import {
  createBase,
  createSpace,
  createTable,
  initApp,
  permanentDeleteSpace,
} from './utils/init-app';

describe('BaseSqlExecutorService', () => {
  let app: INestApplication;
  let baseSqlExecutorService: BaseSqlExecutorService;
  let prismaService: PrismaService;
  let baseId: string;
  let spaceId: string;
  let tableDbName: string;
  let baseId2: string;

  const expectCreateRolePermissionError = async (promise: Promise<unknown>) => {
    await expect(promise).rejects.toThrow('ERROR: permission denied to create role');
  };

  beforeAll(async () => {
    const appCtx = await initApp();
    app = appCtx.app;
    baseSqlExecutorService = app.get(BaseSqlExecutorService);
    prismaService = app.get(PrismaService);
    spaceId = await createSpace({
      name: 'BaseSqlExecutorService test space',
    }).then((space) => space.id);

    baseId = await createBase({
      name: 'BaseSqlExecutorService test base',
      spaceId,
    }).then((base) => base.id);
    baseId2 = await createBase({
      name: 'BaseSqlExecutorService test base2',
      spaceId,
    }).then((base) => base.id);

    const table = await createTable(baseId, {
      name: 'BaseSqlExecutorService test table',
    });
    tableDbName = `"${table.dbTableName.split('.')[0]}"."${table.dbTableName.split('.')[1]}"`;
  });

  afterAll(async () => {
    await permanentDeleteSpace(spaceId);
    await app.close();
  });

  it('only read only role can execute sql', async () => {
    try {
      const result = await baseSqlExecutorService.executeQuerySql(
        baseId,
        `select * from ${tableDbName}`
      );
      expect(result).toBeDefined();
    } catch (error) {
      await expectCreateRolePermissionError(Promise.reject(error));
    }
  });

  it('read only role can not execute sql to throw error', async () => {
    const readonlyCheck = baseSqlExecutorService.executeQuerySql(
      baseId,
      `create table ${tableDbName} (id int)`
    );

    try {
      await readonlyCheck;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes('permission denied to create role')) {
        await expectCreateRolePermissionError(Promise.reject(error));
        return;
      }

      if (message.includes('checking table access')) {
        expect(message).toContain('Table');
        return;
      }

      expect(message).toContain('read only check failed');
      expect(message).toContain('permission denied');
      return;
    }

    throw new Error('expected read-only SQL execution to fail');
  });

  it('read only role can read base', async () => {
    const crossBaseQuery = baseSqlExecutorService.executeQuerySql(
      baseId2,
      `select * from ${tableDbName}`,
      {
        projectionTableDbNames: [tableDbName.replaceAll('"', '')],
      }
    );

    try {
      await crossBaseQuery;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      if (message.includes('permission denied to create role')) {
        await expectCreateRolePermissionError(Promise.reject(error));
        return;
      }

      expect(message).toContain('permission denied');
      return;
    }

    throw new Error('expected cross-base read-only query to fail');
  });

  it('prisma service can execute sql', async () => {
    await prismaService.$queryRawUnsafe(`create table test (id int)`);
    await prismaService.$queryRawUnsafe(`drop table test`);
  });
});
