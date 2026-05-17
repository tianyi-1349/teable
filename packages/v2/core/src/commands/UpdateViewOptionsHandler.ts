import { ViewType as V1ViewType, validateOptionsType } from '@teable/core';
import type { IViewOptions } from '@teable/core';
import { inject, injectable } from '@teable/v2-di';
import { err, ok, safeTry } from 'neverthrow';
import type { Result } from 'neverthrow';

import { TableQueryService } from '../application/services/TableQueryService';
import { TableUpdateFlow } from '../application/services/TableUpdateFlow';
import type { DomainError } from '../domain/shared/DomainError';
import { domainError } from '../domain/shared/DomainError';
import type { IDomainEvent } from '../domain/shared/DomainEvent';
import { TableUpdateViewOptionsSpec } from '../domain/table/specs/TableUpdateViewOptionsSpec';
import type { Table } from '../domain/table/Table';
import * as ExecutionContextPort from '../ports/ExecutionContext';
import { v2CoreTokens } from '../ports/tokens';
import { CommandHandler, type ICommandHandler } from './CommandHandler';
import { UpdateViewOptionsCommand } from './UpdateViewOptionsCommand';

export class UpdateViewOptionsResult {
  private constructor(
    readonly table: Table,
    readonly events: ReadonlyArray<IDomainEvent>
  ) {}

  static create(table: Table, events: ReadonlyArray<IDomainEvent>): UpdateViewOptionsResult {
    return new UpdateViewOptionsResult(table, [...events]);
  }
}

@CommandHandler(UpdateViewOptionsCommand)
@injectable()
export class UpdateViewOptionsHandler
  implements ICommandHandler<UpdateViewOptionsCommand, UpdateViewOptionsResult>
{
  constructor(
    @inject(v2CoreTokens.tableQueryService)
    private readonly tableQueryService: TableQueryService,
    @inject(v2CoreTokens.tableUpdateFlow)
    private readonly tableUpdateFlow: TableUpdateFlow
  ) {}

  private validateOptions(
    table: Table,
    command: UpdateViewOptionsCommand
  ): Result<void, DomainError> {
    const viewResult = table.getView(command.viewId);
    if (viewResult.isErr()) {
      return err(viewResult.error);
    }

    const message = validateOptionsType(
      viewResult.value.type().toString() as V1ViewType,
      command.options as IViewOptions
    );
    if (message) {
      return err(
        domainError.validation({
          code: 'view.options_invalid',
          message,
          details: {
            viewId: command.viewId.toString(),
            viewType: viewResult.value.type().toString(),
          },
        })
      );
    }

    return ok(undefined);
  }

  private buildSpec(
    table: Table,
    command: UpdateViewOptionsCommand
  ): Result<TableUpdateViewOptionsSpec, DomainError> {
    const viewResult = table.getView(command.viewId);
    if (viewResult.isErr()) {
      return err(viewResult.error);
    }

    const currentOptions = viewResult.value.options();
    const nextOptions =
      currentOptions && typeof currentOptions === 'object'
        ? {
            ...(currentOptions as Record<string, unknown>),
            ...(command.options as Record<string, unknown>),
          }
        : command.options;

    return ok(
      TableUpdateViewOptionsSpec.create([
        {
          viewId: command.viewId,
          options: nextOptions,
        },
      ])
    );
  }

  async handle(
    context: ExecutionContextPort.IExecutionContext,
    command: UpdateViewOptionsCommand
  ): Promise<Result<UpdateViewOptionsResult, DomainError>> {
    const handler = this;
    return safeTry<UpdateViewOptionsResult, DomainError>(async function* () {
      const table = yield* await handler.tableQueryService.getByIdInBase(
        context,
        command.baseId,
        command.tableId
      );

      yield* handler.validateOptions(table, command);
      const spec = yield* handler.buildSpec(table, command);

      const updateResult = yield* await handler.tableUpdateFlow.execute(context, command, (table) =>
        table.update((mutator) => mutator.applySpecs([spec]))
      );

      return ok(UpdateViewOptionsResult.create(updateResult.table, updateResult.events));
    });
  }
}
