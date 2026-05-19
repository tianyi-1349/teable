import type { IColumnMetaRo } from '@teable/core';
import { inject, injectable } from '@teable/v2-di';
import { err, ok, safeTry } from 'neverthrow';
import type { Result } from 'neverthrow';

import { TableQueryService } from '../application/services/TableQueryService';
import { TableUpdateFlow } from '../application/services/TableUpdateFlow';
import type { DomainError } from '../domain/shared/DomainError';
import { domainError } from '../domain/shared/DomainError';
import type { IDomainEvent } from '../domain/shared/DomainEvent';
import { TableUpdateViewColumnMetaSpec } from '../domain/table/specs/TableUpdateViewColumnMetaSpec';
import type { Table } from '../domain/table/Table';
import { ViewColumnMeta } from '../domain/table/views/ViewColumnMeta';
import { ViewType } from '../domain/table/views/ViewType';
import type * as ExecutionContextPort from '../ports/ExecutionContext';
import { v2CoreTokens } from '../ports/tokens';
import { CommandHandler, type ICommandHandler } from './CommandHandler';
import { UpdateViewColumnMetaCommand } from './UpdateViewColumnMetaCommand';

export class UpdateViewColumnMetaResult {
  private constructor(
    readonly table: Table,
    readonly events: ReadonlyArray<IDomainEvent>
  ) {}

  static create(table: Table, events: ReadonlyArray<IDomainEvent>): UpdateViewColumnMetaResult {
    return new UpdateViewColumnMetaResult(table, [...events]);
  }
}

@CommandHandler(UpdateViewColumnMetaCommand)
@injectable()
export class UpdateViewColumnMetaHandler
  implements ICommandHandler<UpdateViewColumnMetaCommand, UpdateViewColumnMetaResult>
{
  constructor(
    @inject(v2CoreTokens.tableQueryService)
    private readonly tableQueryService: TableQueryService,
    @inject(v2CoreTokens.tableUpdateFlow)
    private readonly tableUpdateFlow: TableUpdateFlow
  ) {}

  private ensureFieldsBelongToTable(
    table: Table,
    columnMetaRo: IColumnMetaRo
  ): Result<void, DomainError> {
    const fieldIds = new Set(table.getFields().map((field) => field.id().toString()));
    const invalidFieldIds = columnMetaRo
      .map((item) => item.fieldId)
      .filter((fieldId) => !fieldIds.has(fieldId));

    if (invalidFieldIds.length > 0) {
      return err(
        domainError.notFound({
          code: 'field.not_found',
          message: `Fields ${invalidFieldIds.join(', ')} not found in table ${table.id().toString()}`,
          details: {
            tableId: table.id().toString(),
            fieldIds: invalidFieldIds,
          },
        })
      );
    }

    return ok(undefined);
  }

  private ensurePrimaryFieldVisibility(
    table: Table,
    command: UpdateViewColumnMetaCommand
  ): Result<void, DomainError> {
    const primaryFieldId = table.primaryFieldId().toString();
    const viewResult = table.getView(command.viewId);
    if (viewResult.isErr()) {
      return err(viewResult.error);
    }

    const hidesPrimaryField = command.columnMeta.some(
      (item) =>
        item.fieldId === primaryFieldId &&
        'hidden' in item.columnMeta &&
        item.columnMeta.hidden === true
    );
    const allowHiddenPrimaryTypes = [ViewType.calendar().toString(), ViewType.form().toString()];

    if (
      hidesPrimaryField &&
      !allowHiddenPrimaryTypes.includes(viewResult.value.type().toString())
    ) {
      return err(
        domainError.validation({
          code: 'view.primary_field_cannot_be_hidden',
          message: `Primary field can not be hidden for view type ${viewResult.value.type().toString()}`,
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
    command: UpdateViewColumnMetaCommand
  ): Result<TableUpdateViewColumnMetaSpec, DomainError> {
    const viewResult = table.getView(command.viewId);
    if (viewResult.isErr()) {
      return err(viewResult.error);
    }

    const currentColumnMetaResult = viewResult.value.columnMeta();
    if (currentColumnMetaResult.isErr()) {
      return err(currentColumnMetaResult.error);
    }

    const mergedColumnMeta = { ...currentColumnMetaResult.value.toDto() };
    for (const { fieldId, columnMeta } of command.columnMeta) {
      mergedColumnMeta[fieldId] = {
        ...(mergedColumnMeta[fieldId] ?? {}),
        ...columnMeta,
      };
    }

    return ViewColumnMeta.create(mergedColumnMeta).map((columnMeta) =>
      TableUpdateViewColumnMetaSpec.create([
        {
          viewId: command.viewId,
          fieldId: table.primaryFieldId(),
          columnMeta,
        },
      ])
    );
  }

  async handle(
    context: ExecutionContextPort.IExecutionContext,
    command: UpdateViewColumnMetaCommand
  ): Promise<Result<UpdateViewColumnMetaResult, DomainError>> {
    const handler = this;
    return safeTry<UpdateViewColumnMetaResult, DomainError>(async function* () {
      const table = yield* await handler.tableQueryService.getByIdInBase(
        context,
        command.baseId,
        command.tableId
      );

      yield* handler.ensureFieldsBelongToTable(table, command.columnMeta);
      yield* handler.ensurePrimaryFieldVisibility(table, command);

      const spec = yield* handler.buildSpec(table, command);
      const updateResult = yield* await handler.tableUpdateFlow.execute(context, command, (table) =>
        table.update((mutator) => mutator.applySpecs([spec]))
      );

      return ok(UpdateViewColumnMetaResult.create(updateResult.table, updateResult.events));
    });
  }
}
