import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import type { DomainError } from '../../shared/DomainError';
import { MutateOnlySpec } from '../../shared/specification/MutateOnlySpec';
import { Table } from '../Table';
import { copyViewState } from '../views/copyViewState';
import type { View } from '../views/View';
import type { ViewId } from '../views/ViewId';
import { CloneViewVisitor } from '../views/visitors/CloneViewVisitor';
import type { ITableSpecVisitor } from './ITableSpecVisitor';

export type TableViewOptionsUpdate = {
  viewId: ViewId;
  options: unknown;
};

export class TableUpdateViewOptionsSpec<
  V extends ITableSpecVisitor = ITableSpecVisitor,
> extends MutateOnlySpec<Table, V> {
  private constructor(private readonly updatesValue: ReadonlyArray<TableViewOptionsUpdate>) {
    super();
  }

  static create(updates: ReadonlyArray<TableViewOptionsUpdate>): TableUpdateViewOptionsSpec {
    return new TableUpdateViewOptionsSpec(updates);
  }

  updates(): ReadonlyArray<TableViewOptionsUpdate> {
    return this.updatesValue;
  }

  mutate(t: Table): Result<Table, DomainError> {
    if (this.updatesValue.length === 0) {
      return ok(t);
    }

    const updatesByViewId = new Map<string, unknown>();
    for (const update of this.updatesValue) {
      updatesByViewId.set(update.viewId.toString(), update.options);
    }

    const nextViews: View[] = [];
    for (const view of t.views()) {
      const nextOptions = updatesByViewId.get(view.id().toString());
      if (nextOptions === undefined) {
        nextViews.push(view);
        continue;
      }

      const cloneResult = view.accept(new CloneViewVisitor());
      if (cloneResult.isErr()) {
        return err(cloneResult.error);
      }

      const copyResult = copyViewState(view, cloneResult.value, { options: nextOptions });
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
    return v.visitTableUpdateViewOptions(this).map(() => undefined);
  }
}
