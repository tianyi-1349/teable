import { inject, injectable } from '@teable/v2-di';
import { err, ok, safeTry } from 'neverthrow';
import type { Result } from 'neverthrow';

import { TableQueryService } from '../application/services/TableQueryService';
import { TableUpdateFlow } from '../application/services/TableUpdateFlow';
import type { DomainError } from '../domain/shared/DomainError';
import { domainError } from '../domain/shared/DomainError';
import type { IDomainEvent } from '../domain/shared/DomainEvent';
import { TableUpdateViewPropertiesSpec } from '../domain/table/specs/TableUpdateViewPropertiesSpec';
import type { Table } from '../domain/table/Table';
import type * as ExecutionContextPort from '../ports/ExecutionContext';
import { v2CoreTokens } from '../ports/tokens';
import { CommandHandler, type ICommandHandler } from './CommandHandler';
import { UpdateViewOrderCommand } from './UpdateViewOrderCommand';

export class UpdateViewOrderResult {
  private constructor(
    readonly table: Table,
    readonly events: ReadonlyArray<IDomainEvent>
  ) {}

  static create(table: Table, events: ReadonlyArray<IDomainEvent>): UpdateViewOrderResult {
    return new UpdateViewOrderResult(table, [...events]);
  }
}

@CommandHandler(UpdateViewOrderCommand)
@injectable()
export class UpdateViewOrderHandler
  implements ICommandHandler<UpdateViewOrderCommand, UpdateViewOrderResult>
{
  constructor(
    @inject(v2CoreTokens.tableQueryService)
    private readonly tableQueryService: TableQueryService,
    @inject(v2CoreTokens.tableUpdateFlow)
    private readonly tableUpdateFlow: TableUpdateFlow
  ) {}

  private buildSpec(
    table: Table,
    command: UpdateViewOrderCommand
  ): Result<TableUpdateViewPropertiesSpec, DomainError> {
    const viewResult = table.getView(command.viewId);
    if (viewResult.isErr()) {
      return err(viewResult.error);
    }

    const anchorViewResult = table.getView(command.anchorId);
    if (anchorViewResult.isErr()) {
      return err(
        domainError.notFound({
          code: 'view.anchor_not_found',
          message: `Anchor not found with id: ${command.anchorId.toString()}`,
        })
      );
    }

    const view = viewResult.value;
    const anchorView = anchorViewResult.value;
    const currentOrder = view.order();
    const anchorOrder = anchorView.order();
    if (currentOrder === undefined || anchorOrder === undefined) {
      return err(domainError.invariant({ message: 'View order not set' }));
    }

    const sortedViews = [...table.views()]
      .filter((candidate) => candidate.id().toString() !== command.viewId.toString())
      .filter((candidate) => candidate.order() !== undefined)
      .sort((a, b) => (a.order() as number) - (b.order() as number));

    const nextNeighbor =
      command.position === 'before'
        ? [...sortedViews]
            .filter((candidate) => (candidate.order() as number) < anchorOrder)
            .sort((a, b) => (b.order() as number) - (a.order() as number))[0]
        : [...sortedViews]
            .filter((candidate) => (candidate.order() as number) > anchorOrder)
            .sort((a, b) => (a.order() as number) - (b.order() as number))[0];

    const nextOrder = nextNeighbor
      ? ((nextNeighbor.order() as number) + anchorOrder) / 2
      : anchorOrder + (command.position === 'before' ? -1 : 1);

    if (Math.abs(nextOrder - anchorOrder) < Number.EPSILON * 2) {
      return err(
        domainError.validation({
          code: 'view.order_gap_too_small',
          message: 'Not enough gap to update view order',
        })
      );
    }

    if (nextOrder === currentOrder) {
      return ok(TableUpdateViewPropertiesSpec.create([]));
    }

    return ok(TableUpdateViewPropertiesSpec.create([{ viewId: command.viewId, order: nextOrder }]));
  }

  async handle(
    context: ExecutionContextPort.IExecutionContext,
    command: UpdateViewOrderCommand
  ): Promise<Result<UpdateViewOrderResult, DomainError>> {
    const handler = this;
    return safeTry<UpdateViewOrderResult, DomainError>(async function* () {
      const table = yield* await handler.tableQueryService.getByIdInBase(
        context,
        command.baseId,
        command.tableId
      );

      const spec = yield* handler.buildSpec(table, command);
      const updateResult = yield* await handler.tableUpdateFlow.execute(context, command, (table) =>
        table.update((mutator) => mutator.applySpecs([spec]))
      );

      return ok(UpdateViewOrderResult.create(updateResult.table, updateResult.events));
    });
  }
}
