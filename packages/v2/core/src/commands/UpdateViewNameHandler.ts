import { inject, injectable } from '@teable/v2-di';
import { ok, safeTry } from 'neverthrow';
import type { Result } from 'neverthrow';

import { TableUpdateFlow } from '../application/services/TableUpdateFlow';
import type { DomainError } from '../domain/shared/DomainError';
import type { IDomainEvent } from '../domain/shared/DomainEvent';
import { TableUpdateViewNameSpec } from '../domain/table/specs/TableUpdateViewNameSpec';
import type { Table } from '../domain/table/Table';
import * as ExecutionContextPort from '../ports/ExecutionContext';
import { v2CoreTokens } from '../ports/tokens';
import { CommandHandler, type ICommandHandler } from './CommandHandler';
import { UpdateViewNameCommand } from './UpdateViewNameCommand';

export class UpdateViewNameResult {
  private constructor(
    readonly table: Table,
    readonly events: ReadonlyArray<IDomainEvent>
  ) {}

  static create(table: Table, events: ReadonlyArray<IDomainEvent>): UpdateViewNameResult {
    return new UpdateViewNameResult(table, [...events]);
  }
}

@CommandHandler(UpdateViewNameCommand)
@injectable()
export class UpdateViewNameHandler
  implements ICommandHandler<UpdateViewNameCommand, UpdateViewNameResult>
{
  constructor(
    @inject(v2CoreTokens.tableUpdateFlow)
    private readonly tableUpdateFlow: TableUpdateFlow
  ) {}

  async handle(
    context: ExecutionContextPort.IExecutionContext,
    command: UpdateViewNameCommand
  ): Promise<Result<UpdateViewNameResult, DomainError>> {
    const handler = this;
    return safeTry<UpdateViewNameResult, DomainError>(async function* () {
      const spec = TableUpdateViewNameSpec.create([{ viewId: command.viewId, name: command.name }]);
      const updateResult = yield* await handler.tableUpdateFlow.execute(context, command, (table) =>
        table.update((mutator) => mutator.applySpecs([spec]))
      );
      return ok(UpdateViewNameResult.create(updateResult.table, updateResult.events));
    });
  }
}
