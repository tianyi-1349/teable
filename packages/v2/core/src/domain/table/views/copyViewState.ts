import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import type { DomainError } from '../../shared/DomainError';
import type { ViewColumnMeta } from './ViewColumnMeta';
import type { ViewQueryDefaults } from './ViewQueryDefaults';
import type { View } from './View';

type ViewStateOverrides = {
  columnMeta?: ViewColumnMeta;
  queryDefaults?: ViewQueryDefaults;
  options?: unknown;
  description?: string | null;
  order?: number;
  isLocked?: boolean;
  shareMeta?: unknown;
};

const hasOwn = <T extends object>(value: T, key: keyof ViewStateOverrides): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

export const copyViewState = (
  source: View,
  target: View,
  overrides: ViewStateOverrides = {}
): Result<View, DomainError> => {
  const columnMetaResult = hasOwn(overrides, 'columnMeta')
    ? ok(overrides.columnMeta)
    : source.columnMeta();
  if (columnMetaResult.isErr()) return err(columnMetaResult.error);
  if (columnMetaResult.value) {
    const setColumnMetaResult = target.setColumnMeta(columnMetaResult.value);
    if (setColumnMetaResult.isErr()) return err(setColumnMetaResult.error);
  }

  const queryDefaultsResult = hasOwn(overrides, 'queryDefaults')
    ? ok(overrides.queryDefaults)
    : source.queryDefaults();
  if (queryDefaultsResult.isErr()) return err(queryDefaultsResult.error);
  if (queryDefaultsResult.value) {
    const setQueryDefaultsResult = target.setQueryDefaults(queryDefaultsResult.value);
    if (setQueryDefaultsResult.isErr()) return err(setQueryDefaultsResult.error);
  }

  const options = hasOwn(overrides, 'options') ? overrides.options : source.options();
  const setOptionsResult = target.setOptions(options);
  if (setOptionsResult.isErr()) return err(setOptionsResult.error);

  const description = hasOwn(overrides, 'description')
    ? overrides.description
    : source.description();
  const setDescriptionResult = target.setDescription(description);
  if (setDescriptionResult.isErr()) return err(setDescriptionResult.error);

  const order = hasOwn(overrides, 'order') ? overrides.order : source.order();
  const setOrderResult = target.setOrder(order);
  if (setOrderResult.isErr()) return err(setOrderResult.error);

  const isLocked = hasOwn(overrides, 'isLocked') ? overrides.isLocked : source.isLocked();
  const setIsLockedResult = target.setIsLocked(isLocked);
  if (setIsLockedResult.isErr()) return err(setIsLockedResult.error);

  const shareMeta = hasOwn(overrides, 'shareMeta') ? overrides.shareMeta : source.shareMeta();
  const setShareMetaResult = target.setShareMeta(shareMeta);
  if (setShareMetaResult.isErr()) return err(setShareMetaResult.error);

  return ok(target);
};
