import { inject, injectable } from '@teable/v2-di';
import { err, ok, safeTry } from 'neverthrow';
import type { Result } from 'neverthrow';

import { TableQueryService } from '../application/services/TableQueryService';
import { TableUpdateFlow } from '../application/services/TableUpdateFlow';
import type { DomainError } from '../domain/shared/DomainError';
import type { IDomainEvent } from '../domain/shared/DomainEvent';
import { TableUpdateViewQueryDefaultsSpec } from '../domain/table/specs/TableUpdateViewQueryDefaultsSpec';
import type { Table } from '../domain/table/Table';
import { ViewQueryDefaults } from '../domain/table/views/ViewQueryDefaults';
import * as ExecutionContextPort from '../ports/ExecutionContext';
import { v2CoreTokens } from '../ports/tokens';
import { CommandHandler, type ICommandHandler } from './CommandHandler';
import { UpdateViewFilterCommand } from './UpdateViewFilterCommand';

export class UpdateViewFilterResult {
  private constructor(
    readonly table: Table,
    readonly events: ReadonlyArray<IDomainEvent>
  ) {}

  static create(table: Table, events: ReadonlyArray<IDomainEvent>): UpdateViewFilterResult {
    return new UpdateViewFilterResult(table, [...events]);
  }
}

@CommandHandler(UpdateViewFilterCommand)
@injectable()
export class UpdateViewFilterHandler
  implements ICommandHandler<UpdateViewFilterCommand, UpdateViewFilterResult>
{
  constructor(
    @inject(v2CoreTokens.tableQueryService)
    private readonly tableQueryService: TableQueryService,
    @inject(v2CoreTokens.tableUpdateFlow)
    private readonly tableUpdateFlow: TableUpdateFlow
  ) {}

  private buildSpec(
    table: Table,
    command: UpdateViewFilterCommand
  ): Result<TableUpdateViewQueryDefaultsSpec, DomainError> {
    const viewResult = table.getView(command.viewId);
    if (viewResult.isErr()) {
      return err(viewResult.error);
    }

    const currentQueryDefaultsResult = viewResult.value.queryDefaults();
    if (currentQueryDefaultsResult.isErr()) {
      return err(currentQueryDefaultsResult.error);
    }

    const currentQueryDefaults = currentQueryDefaultsResult.value.toDto();
    return ViewQueryDefaults.rehydrate({
      ...currentQueryDefaults,
      filter: command.filter,
    }).map((queryDefaults) =>
      TableUpdateViewQueryDefaultsSpec.create([
        {
          viewId: command.viewId,
          queryDefaults,
        },
      ])
    );
  }

  async handle(
    context: ExecutionContextPort.IExecutionContext,
    command: UpdateViewFilterCommand
  ): Promise<Result<UpdateViewFilterResult, DomainError>> {
    const handler = this;
    return safeTry<UpdateViewFilterResult, DomainError>(async function* () {
      const table = yield* await handler.tableQueryService.getByIdInBase(
        context,
        command.baseId,
        command.tableId
      );

      const spec = yield* handler.buildSpec(table, command);
      const updateResult = yield* await handler.tableUpdateFlow.execute(context, command, (table) =>
        table.update((mutator) => mutator.applySpecs([spec]))
      );

      return ok(UpdateViewFilterResult.create(updateResult.table, updateResult.events));
    });
  }
}
