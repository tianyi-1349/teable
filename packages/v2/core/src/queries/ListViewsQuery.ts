import type { Result } from 'neverthrow';

import type { DomainError } from '../domain/shared/DomainError';
import { GetTableByIdQuery, type IGetTableByIdQueryInput } from './GetTableByIdQuery';

export type IListViewsQueryInput = IGetTableByIdQueryInput;

export class ListViewsQuery extends GetTableByIdQuery {
  static override create(raw: unknown): Result<ListViewsQuery, DomainError> {
    return GetTableByIdQuery.create(raw).map(
      (query) => new ListViewsQuery(query.baseId, query.tableId)
    );
  }
}
