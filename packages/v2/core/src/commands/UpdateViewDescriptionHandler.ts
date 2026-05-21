import { inject, injectable } from '@teable/v2-di';
import { ok, safeTry } from 'neverthrow';
import type { Result } from 'neverthrow';

import { TableQueryService } from '../application/services/TableQueryService';
import { TableUpdateFlow } from '../application/services/TableUpdateFlow';
import type { DomainError } from '../domain/shared/DomainError';
import type { IDomainEvent } from '../domain/shared/DomainEvent';
import { TableUpdateViewPropertiesSpec } from '../domain/table/specs/TableUpdateViewPropertiesSpec';
import type { Table } from '../domain/table/Table';
import type * as ExecutionContextPort from '../ports/ExecutionContext';
import { v2CoreTokens } from '../ports/tokens';
import { CommandHandler, type ICommandHandler } from './CommandHandler';
import { UpdateViewDescriptionCommand } from './UpdateViewDescriptionCommand';

export class UpdateViewDescriptionResult {
  private constructor(
    readonly table: Table,
    readonly events: ReadonlyArray<IDomainEvent>
  ) {}

  static create(table: Table, events: ReadonlyArray<IDomainEvent>): UpdateViewDescriptionResult {
    return new UpdateViewDescriptionResult(table, [...events]);
  }
}

@CommandHandler(UpdateViewDescriptionCommand)
@injectable()
export class UpdateViewDescriptionHandler
  implements ICommandHandler<UpdateViewDescriptionCommand, UpdateViewDescriptionResult>
{
  constructor(
    @inject(v2CoreTokens.tableQueryService)
    private readonly tableQueryService: TableQueryService,
    @inject(v2CoreTokens.tableUpdateFlow)
    private readonly tableUpdateFlow: TableUpdateFlow
  ) {}

  async handle(
    context: ExecutionContextPort.IExecutionContext,
    command: UpdateViewDescriptionCommand
  ): Promise<Result<UpdateViewDescriptionResult, DomainError>> {
    const handler = this;
    return safeTry<UpdateViewDescriptionResult, DomainError>(async function* () {
      const table = yield* await handler.tableQueryService.getByIdInBase(
        context,
        command.baseId,
        command.tableId
      );
      yield* table.getView(command.viewId);

      const spec = TableUpdateViewPropertiesSpec.create([
        { viewId: command.viewId, description: command.description },
      ]);
      const updateResult = yield* await handler.tableUpdateFlow.execute(context, command, (table) =>
        table.update((mutator) => mutator.applySpecs([spec]))
      );

      return ok(UpdateViewDescriptionResult.create(updateResult.table, updateResult.events));
    });
  }
}
