export type { IV2PostgresDbConfig } from '@teable/v2-adapter-db-postgres-shared';
export {
  PostgresUnitOfWork,
  PostgresUnitOfWorkTransaction,
  getPostgresTransaction,
  resolvePostgresDbOrTx,
  v2PostgresDbConfigSchema,
  v2PostgresDbTokens,
} from '@teable/v2-adapter-db-postgres-shared';

export { createV2PostgresJsDb } from './createDb';
export { registerV2PostgresJsDb } from './di/register';
