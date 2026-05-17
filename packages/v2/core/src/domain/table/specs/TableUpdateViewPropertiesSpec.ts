import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import type { DomainError } from '../../shared/DomainError';
import { MutateOnlySpec } from '../../shared/specification/MutateOnlySpec';
import { Table } from '../Table';
import type { View } from '../views/View';
import { copyViewState } from '../views/copyViewState';
import type { ViewId } from '../views/ViewId';
import { CloneViewVisitor } from '../views/visitors/CloneViewVisitor';
import type { ITableSpecVisitor } from './ITableSpecVisitor';

export type TableViewPropertiesUpdate = {
  viewId: ViewId;
  description?: string | null;
  isLocked?: boolean;
  shareMeta?: unknown;
  order?: number;
};

export class TableUpdateViewPropertiesSpec<
  V extends ITableSpecVisitor = ITableSpecVisitor,
> extends MutateOnlySpec<Table, V> {
  private constructor(private readonly updatesValue: ReadonlyArray<TableViewPropertiesUpdate>) {
    super();
  }

  static create(updates: ReadonlyArray<TableViewPropertiesUpdate>): TableUpdateViewPropertiesSpec {
    return new TableUpdateViewPropertiesSpec(updates);
  }

  updates(): ReadonlyArray<TableViewPropertiesUpdate> {
    return this.updatesValue;
  }

  mutate(t: Table): Result<Table, DomainError> {
    if (this.updatesValue.length === 0) {
      return ok(t);
    }

    const updatesByViewId = new Map<string, TableViewPropertiesUpdate>();
    for (const update of this.updatesValue) {
      updatesByViewId.set(update.viewId.toString(), update);
    }

    const nextViews: View[] = [];
    for (const view of t.views()) {
      const nextUpdate = updatesByViewId.get(view.id().toString());
      if (!nextUpdate) {
        nextViews.push(view);
        continue;
      }

      const cloneResult = view.accept(new CloneViewVisitor());
      if (cloneResult.isErr()) {
        return err(cloneResult.error);
      }

      const copyResult = copyViewState(view, cloneResult.value, {
        ...(Object.prototype.hasOwnProperty.call(nextUpdate, 'description')
          ? { description: nextUpdate.description }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(nextUpdate, 'isLocked')
          ? { isLocked: nextUpdate.isLocked }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(nextUpdate, 'shareMeta')
          ? { shareMeta: nextUpdate.shareMeta }
          : {}),
        ...(Object.prototype.hasOwnProperty.call(nextUpdate, 'order')
          ? { order: nextUpdate.order }
          : {}),
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
    return v.visitTableUpdateViewProperties(this).map(() => undefined);
  }
}
