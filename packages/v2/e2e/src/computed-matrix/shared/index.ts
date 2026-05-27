/**
 * Shared exports for computed matrix tests
 */

export type {
  ChainTestCase,
  ComputedFieldType,
  ConditionalTestCase,
  ExpectedResult,
  ExpectedSteps,
  FormulaTestCase,
  LinkConfig,
  LinkDirection,
  LinkOpTestCase,
  LinkRelationship,
  LookupTestCase,
  OperationType,
  RollupTestCase,
  SelfRefTestCase,
  SelfRefType,
  SourceFieldType,
  TestContext,
  ValueTransition,
} from './types';
export { createFieldIdGenerator, getFieldValues, getFormulaExpression } from './generators';
export { getExpectedResult, getExpectedSteps, verifyResult, verifySteps } from './validators';
export { createTestContext } from './setup';
