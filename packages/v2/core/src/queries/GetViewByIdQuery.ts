import { err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import type { BaseId } from '../domain/base/BaseId';
import type { DomainError } from '../domain/shared/DomainError';
import { domainError } from '../domain/shared/DomainError';
import type { TableId } from '../domain/table/TableId';
import { ViewId } from '../domain/table/views/ViewId';
import { GetTableByIdQuery, getTableByIdInputSchema } from './GetTableByIdQuery';

export const getViewByIdInputSchema = getTableByIdInputSchema.extend({
  viewId: z.string(),
});

export type IGetViewByIdQueryInput = z.input<typeof getViewByIdInputSchema>;

export class GetViewByIdQuery extends GetTableByIdQuery {
  private constructor(
    baseId: BaseId,
    tableId: TableId,
    readonly viewId: ViewId
  ) {
    super(baseId, tableId);
  }

  static override create(raw: unknown): Result<GetViewByIdQuery, DomainError> {
    const parsed = getViewByIdInputSchema.safeParse(raw);
    if (!parsed.success) {
      return err(domainError.validation({ message: 'Invalid GetViewByIdQuery input' }));
    }

    return GetTableByIdQuery.create(parsed.data).andThen((query) =>
      ViewId.create(parsed.data.viewId).map(
        (viewId) => new GetViewByIdQuery(query.baseId, query.tableId, viewId)
      )
    );
  }
}
