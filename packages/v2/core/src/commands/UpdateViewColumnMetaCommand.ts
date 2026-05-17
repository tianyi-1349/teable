import type { IColumnMetaRo } from '@teable/core';
import { columnMetaRoSchema } from '@teable/core';
import { err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import { BaseId } from '../domain/base/BaseId';
import { domainError, type DomainError } from '../domain/shared/DomainError';
import { TableId } from '../domain/table/TableId';
import { ViewId } from '../domain/table/views/ViewId';
import { TableUpdateCommand } from './TableUpdateCommand';

export const updateViewColumnMetaCommandInputSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  columnMeta: columnMetaRoSchema,
});

export type IUpdateViewColumnMetaCommandInput = z.input<
  typeof updateViewColumnMetaCommandInputSchema
>;

export class UpdateViewColumnMetaCommand extends TableUpdateCommand {
  private constructor(
    baseId: BaseId,
    tableId: TableId,
    readonly viewId: ViewId,
    readonly columnMeta: IColumnMetaRo
  ) {
    super(baseId, tableId);
  }

  static create(raw: unknown): Result<UpdateViewColumnMetaCommand, DomainError> {
    const parsed = updateViewColumnMetaCommandInputSchema.safeParse(raw);
    if (!parsed.success) {
      return err(
        domainError.validation({
          message: 'Invalid UpdateViewColumnMetaCommand input',
          details: z.formatError(parsed.error),
        })
      );
    }

    return BaseId.create(parsed.data.baseId).andThen((baseId) =>
      TableId.create(parsed.data.tableId).andThen((tableId) =>
        ViewId.create(parsed.data.viewId).map(
          (viewId) =>
            new UpdateViewColumnMetaCommand(baseId, tableId, viewId, parsed.data.columnMeta)
        )
      )
    );
  }
}
