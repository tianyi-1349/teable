import { err, ok } from 'neverthrow';
import type { Result } from 'neverthrow';

import type { DomainError } from '../../shared/DomainError';
import { MutateOnlySpec } from '../../shared/specification/MutateOnlySpec';
import { Table } from '../Table';
import { copyViewState } from '../views/copyViewState';
import type { View } from '../views/View';
import {
  createCalendarView,
  createFormView,
  createGalleryView,
  createGridView,
  createKanbanView,
  createPluginView,
} from '../views/ViewFactory';
import type { ViewId } from '../views/ViewId';
import type { ViewName } from '../views/ViewName';
import type { ITableSpecVisitor } from './ITableSpecVisitor';

export type TableViewNameUpdate = {
  viewId: ViewId;
  name: ViewName;
};

export class TableUpdateViewNameSpec<
  V extends ITableSpecVisitor = ITableSpecVisitor,
> extends MutateOnlySpec<Table, V> {
  private constructor(private readonly updatesValue: ReadonlyArray<TableViewNameUpdate>) {
    super();
  }

  static create(updates: ReadonlyArray<TableViewNameUpdate>): TableUpdateViewNameSpec {
    return new TableUpdateViewNameSpec(updates);
  }

  updates(): ReadonlyArray<TableViewNameUpdate> {
    return this.updatesValue;
  }

  mutate(t: Table): Result<Table, DomainError> {
    if (this.updatesValue.length === 0) {
      return ok(t);
    }

    const updatesByViewId = new Map<string, ViewName>();
    for (const update of this.updatesValue) {
      updatesByViewId.set(update.viewId.toString(), update.name);
    }

    const nextViews: View[] = [];
    for (const view of t.views()) {
      const nextName = updatesByViewId.get(view.id().toString());
      if (!nextName) {
        nextViews.push(view);
        continue;
      }

      const factory = {
        grid: createGridView,
        kanban: createKanbanView,
        gallery: createGalleryView,
        calendar: createCalendarView,
        form: createFormView,
        plugin: createPluginView,
      }[view.type().toString()];

      const cloneResult = factory({ id: view.id(), name: nextName });
      if (cloneResult.isErr()) {
        return err(cloneResult.error);
      }

      const copyResult = copyViewState(view, cloneResult.value);
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
    return v.visitTableUpdateViewName(this).map(() => undefined);
  }
}
