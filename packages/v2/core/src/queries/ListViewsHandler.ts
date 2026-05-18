import { inject, injectable } from '@teable/v2-di';
import type { Result } from 'neverthrow';
import { err, ok } from 'neverthrow';

import { TableQueryService } from '../application/services/TableQueryService';
import type { DomainError } from '../domain/shared/DomainError';
import type { View } from '../domain/table/views/View';
import type { IExecutionContext } from '../ports/ExecutionContext';
import { v2CoreTokens } from '../ports/tokens';
import { ListViewsQuery } from './ListViewsQuery';
import { QueryHandler, type IQueryHandler } from './QueryHandler';

export class ListViewsResult {
  private constructor(readonly views: ReadonlyArray<View>) {}

  static create(views: ReadonlyArray<View>): ListViewsResult {
    return new ListViewsResult(views);
  }
}

@QueryHandler(ListViewsQuery)
@injectable()
export class ListViewsHandler implements IQueryHandler<ListViewsQuery, ListViewsResult> {
  constructor(
    @inject(v2CoreTokens.tableQueryService)
    private readonly tableQueryService: TableQueryService
  ) {}

  async handle(
    context: IExecutionContext,
    query: ListViewsQuery
  ): Promise<Result<ListViewsResult, DomainError>> {
    const tableResult = await this.tableQueryService.getByIdInBase(
      context,
      query.baseId,
      query.tableId
    );
    if (tableResult.isErr()) {
      return err(tableResult.error);
    }

    return ok(ListViewsResult.create(tableResult.value.views()));
  }
}
