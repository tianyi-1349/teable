import { inject, injectable } from '@teable/v2-di';
import type { Result } from 'neverthrow';
import { err } from 'neverthrow';

import { TableQueryService } from '../application/services/TableQueryService';
import type { DomainError } from '../domain/shared/DomainError';
import type { View } from '../domain/table/views/View';
import type { IExecutionContext } from '../ports/ExecutionContext';
import { v2CoreTokens } from '../ports/tokens';
import { GetViewByIdQuery } from './GetViewByIdQuery';
import { QueryHandler, type IQueryHandler } from './QueryHandler';

export class GetViewByIdResult {
  private constructor(readonly view: View) {}

  static create(view: View): GetViewByIdResult {
    return new GetViewByIdResult(view);
  }
}

@QueryHandler(GetViewByIdQuery)
@injectable()
export class GetViewByIdHandler implements IQueryHandler<GetViewByIdQuery, GetViewByIdResult> {
  constructor(
    @inject(v2CoreTokens.tableQueryService)
    private readonly tableQueryService: TableQueryService
  ) {}

  async handle(
    context: IExecutionContext,
    query: GetViewByIdQuery
  ): Promise<Result<GetViewByIdResult, DomainError>> {
    const tableResult = await this.tableQueryService.getByIdInBase(
      context,
      query.baseId,
      query.tableId
    );
    if (tableResult.isErr()) {
      return err(tableResult.error);
    }

    return tableResult.value.getView(query.viewId).map((view) => GetViewByIdResult.create(view));
  }
}
