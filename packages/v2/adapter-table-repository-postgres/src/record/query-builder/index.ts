// Interface and types
export type {
  IQueryBuilderDeps,
  ITableRecordQueryBuilder,
  QB,
  DynamicDB,
  SystemColumn,
  OrderByColumn,
} from './ITableRecordQueryBuilder';

// Shared utilities
export type { FieldOutputColumn } from './FieldOutputColumnVisitor';
export { FieldOutputColumnVisitor } from './FieldOutputColumnVisitor';

// Query builder manager (strategy pattern)
export type { QueryMode, IQueryBuilderManagerOptions } from './TableRecordQueryBuilderManager';
export { TableRecordQueryBuilderManager } from './TableRecordQueryBuilderManager';

// Computed query builder (LATERAL joins, formula computation)
export {
  COMPUTED_TABLE_ALIAS,
  ComputedTableRecordQueryBuilder,
} from './computed/ComputedTableRecordQueryBuilder';
export type {
  IDirtyFilterConfig,
  IComputedQueryBuilderOptions,
} from './computed/ComputedTableRecordQueryBuilder';
export { ComputedFieldSelectExpressionVisitor } from './computed/ComputedFieldSelectExpressionVisitor';
export type {
  LinkOrderBy,
  LateralColumnType,
  ILateralContext,
  ComputedFieldSelectExpressionVisitorOptions,
} from './computed/ComputedFieldSelectExpressionVisitor';

// Stored query builder (direct column reads, pre-stored values)
export { StoredFieldSelectVisitor } from './stored/StoredFieldSelectVisitor';
export { StoredTableRecordQueryBuilder } from './stored/StoredTableRecordQueryBuilder';
export type { IStoredQueryBuilderOptions } from './stored/StoredTableRecordQueryBuilder';

// Insert query builder
export {
  RecordInsertBuilder,
  type CompiledSqlStatement,
  type RecordInsertSqlResult,
  type RecordInsertDataResult,
  type RecordInsertBuilderContext,
  type LinkedRecordLockInfo,
  type InsertExclusivityConstraint,
  type UserFieldColumn,
} from './insert';

// Update query builder
export {
  RecordUpdateBuilder,
  type RecordUpdateSqlResult,
  type RecordUpdateBuilderContext,
} from './update';
