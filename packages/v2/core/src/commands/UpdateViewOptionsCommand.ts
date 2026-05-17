import { viewOptionsSchema } from '@teable/core';
import { err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import { BaseId } from '../domain/base/BaseId';
import { domainError, type DomainError } from '../domain/shared/DomainError';
import { TableId } from '../domain/table/TableId';
import { ViewId } from '../domain/table/views/ViewId';
import { TableUpdateCommand } from './TableUpdateCommand';

export const updateViewOptionsCommandInputSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  options: viewOptionsSchema,
});

export type IUpdateViewOptionsCommandInput = z.input<typeof updateViewOptionsCommandInputSchema>;

export class UpdateViewOptionsCommand extends TableUpdateCommand {
  private constructor(
    baseId: BaseId,
    tableId: TableId,
    readonly viewId: ViewId,
    readonly options: z.output<typeof viewOptionsSchema>
  ) {
    super(baseId, tableId);
  }

  static create(raw: unknown): Result<UpdateViewOptionsCommand, DomainError> {
    const parsed = updateViewOptionsCommandInputSchema.safeParse(raw);
    if (!parsed.success) {
      return err(
        domainError.validation({
          message: 'Invalid UpdateViewOptionsCommand input',
          details: z.formatError(parsed.error),
        })
      );
    }

    return BaseId.create(parsed.data.baseId).andThen((baseId) =>
      TableId.create(parsed.data.tableId).andThen((tableId) =>
        ViewId.create(parsed.data.viewId).map(
          (viewId) => new UpdateViewOptionsCommand(baseId, tableId, viewId, parsed.data.options)
        )
      )
    );
  }
}
