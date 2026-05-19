// Types
export type {
  CommandExplainInfo,
  DependencyEdgeInfo,
  DependencyGraphInfo,
  UpdateStepInfo,
  SameTableBatchInfo,
  AffectedRecordEstimate,
  ComputedImpactInfo,
  ComputedUpdateLockRecordInfo,
  ComputedUpdateLockTableInfo,
  ComputedUpdateLockStatementInfo,
  ComputedUpdateLockBatchInfo,
  ComputedUpdateLockInfo,
  LinkRecordLockInfo,
  LinkRecordLocksInfo,
  ExplainPlanNode,
  ExplainJsonOutput,
  ExplainOutput,
  ExplainAnalyzeOutput,
  ComputedUpdateSeedField,
  ComputedUpdateDependency,
  ComputedUpdateTargetField,
  ComputedUpdateReason,
  SqlExplainInfo,
  ExplainTiming,
  ExplainResult,
} from './types/ExplainResult';
export type {
  ComplexityLevel,
  ComplexityFactor,
  ComplexityAssessment,
} from './types/ComplexityAssessment';
export type { ExplainOptions } from './types/ExplainOptions';
export { DEFAULT_EXPLAIN_OPTIONS } from './types/ExplainOptions';

// DI
export { registerCommandExplainModule } from './di/register';
export { v2CommandExplainTokens } from './di/tokens';

// Service
export type { IExplainService } from './service/ExplainService';
export { ExplainService } from './service/ExplainService';

// Analyzers
export type { ICommandAnalyzer } from './analyzers/ICommandAnalyzer';
export { CreateFieldAnalyzer } from './analyzers/CreateFieldAnalyzer';
export { UpdateRecordAnalyzer } from './analyzers/UpdateRecordAnalyzer';
export { CreateRecordAnalyzer } from './analyzers/CreateRecordAnalyzer';
export { UpdateFieldAnalyzer } from './analyzers/UpdateFieldAnalyzer';
export { DeleteFieldAnalyzer } from './analyzers/DeleteFieldAnalyzer';
export { DeleteTableAnalyzer } from './analyzers/DeleteTableAnalyzer';
export { DeleteRecordsAnalyzer } from './analyzers/DeleteRecordsAnalyzer';
export { PasteCommandAnalyzer } from './analyzers/PasteCommandAnalyzer';

// Utils
export type {
  BatchExplainStatement,
  SequentialExplainStatement,
  SequentialExplainStatementResult,
  SetupStatement,
} from './utils/SqlExplainRunner';
export { SqlExplainRunner } from './utils/SqlExplainRunner';
export type { ComplexityInput } from './utils/ComplexityCalculator';
export { ComplexityCalculator } from './utils/ComplexityCalculator';
export { buildLinkRecordLocksInfo } from './utils/LinkRecordLockInfoBuilder';
