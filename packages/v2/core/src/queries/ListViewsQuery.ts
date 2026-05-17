import type { Result } from 'neverthrow';

import { GetTableByIdQuery, type IGetTableByIdQueryInput } from './GetTableByIdQuery';

export type IListViewsQueryInput = IGetTableByIdQueryInput;

export class ListViewsQuery extends GetTableByIdQuery {
  static override create(
    raw: unknown
  ): Result<ListViewsQuery, import('../domain/shared/DomainError').DomainError> {
    return GetTableByIdQuery.create(raw).map(
      (query) => new ListViewsQuery(query.baseId, query.tableId)
    );
  }
}
