export type {
  DebugJsonField,
  DebugTableMeta,
  DebugTableSummary,
  DebugFieldMeta,
  DebugFieldSummary,
  DebugFieldRelationDirection,
  DebugFieldRelationOptions,
  DebugFieldRelationEdgeKind,
  DebugFieldRelationEdgeSemantic,
  DebugFieldRelationEdge,
  DebugFieldRelationNode,
  DebugFieldRelationReport,
  DebugRawRecord,
  DebugRawRecordQueryOptions,
  DebugRawRecordQueryResult,
} from './types';

// Ports
export type { IDebugMetaStore } from './ports/DebugMetaStore';
export type { IDebugRecordStore } from './ports/DebugRecordStore';
export type {
  DebugFieldRelationGraphFieldMeta,
  DebugFieldRelationGraphData,
  IDebugFieldRelationGraph,
} from './ports/FieldRelationGraph';

// DI
export type { V2DebugDataRegistrationOptions } from './di/register';
export { registerV2DebugData } from './di/register';
export { v2DebugDataTokens } from './di/tokens';

// Service
export { DebugDataService } from './service/DebugDataService';

// Adapters
export { PostgresDebugMetaStore } from './adapters/postgres/PostgresDebugMetaStore';
export { PostgresDebugRecordStore } from './adapters/postgres/PostgresDebugRecordStore';
export type { FieldDependencyEdgeKind } from './adapters/postgres/PostgresFieldRelationGraph';
export { PostgresFieldRelationGraph } from './adapters/postgres/PostgresFieldRelationGraph';
