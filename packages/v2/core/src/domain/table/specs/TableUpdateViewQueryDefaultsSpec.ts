import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import type { DomainError } from '../../shared/DomainError';
import { MutateOnlySpec } from '../../shared/specification/MutateOnlySpec';
import { Table } from '../Table';
import { copyViewState } from '../views/copyViewState';
import type { View } from '../views/View';
import type { ViewId } from '../views/ViewId';
import type { ViewQueryDefaults } from '../views/ViewQueryDefaults';
import { CloneViewVisitor } from '../views/visitors/CloneViewVisitor';
import type { ITableSpecVisitor } from './ITableSpecVisitor';

export type TableViewQueryDefaultsUpdate = {
  viewId: ViewId;
  queryDefaults: ViewQueryDefaults;
};

export class TableUpdateViewQueryDefaultsSpec<
  V extends ITableSpecVisitor = ITableSpecVisitor,
> extends MutateOnlySpec<Table, V> {
  private constructor(private readonly updatesValue: ReadonlyArray<TableViewQueryDefaultsUpdate>) {
    super();
  }

  static create(
    updates: ReadonlyArray<TableViewQueryDefaultsUpdate>
  ): TableUpdateViewQueryDefaultsSpec {
    return new TableUpdateViewQueryDefaultsSpec(updates);
  }

  updates(): ReadonlyArray<TableViewQueryDefaultsUpdate> {
    return this.updatesValue;
  }

  mutate(t: Table): Result<Table, DomainError> {
    if (this.updatesValue.length === 0) {
      return ok(t);
    }

    const updatesByViewId = new Map<string, ViewQueryDefaults>();
    for (const update of this.updatesValue) {
      updatesByViewId.set(update.viewId.toString(), update.queryDefaults);
    }

    const nextViews: View[] = [];
    for (const view of t.views()) {
      const nextQueryDefaults = updatesByViewId.get(view.id().toString());
      if (!nextQueryDefaults) {
        nextViews.push(view);
        continue;
      }

      const cloneResult = view.accept(new CloneViewVisitor());
      if (cloneResult.isErr()) {
        return err(cloneResult.error);
      }

      const copyResult = copyViewState(view, cloneResult.value, {
        queryDefaults: nextQueryDefaults,
      });
      if (copyResult.isErr()) {
        return err(copyResult.error);
      }

      nextViews.push(copyResult.value);
    }

    const nextTableResult = Table.rehydrate({
      id: t.id(),
      baseId: t.baseId(),
      name: t.name(),
      fields: t.getFields(),
      views: nextViews,
      primaryFieldId: t.primaryFieldId(),
    });
    if (nextTableResult.isErr()) {
      return nextTableResult;
    }

    const dbTableNameResult = t.dbTableName();
    if (dbTableNameResult.isErr()) {
      return ok(nextTableResult.value);
    }

    const setDbTableNameResult = nextTableResult.value.setDbTableName(dbTableNameResult.value);
    if (setDbTableNameResult.isErr()) {
      return err(setDbTableNameResult.error);
    }

    return ok(nextTableResult.value);
  }

  accept(v: V): Result<void, DomainError> {
    return v.visitTableUpdateViewQueryDefaults(this).map(() => undefined);
  }
}
