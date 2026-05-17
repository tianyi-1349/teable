import { groupSchema } from '@teable/core';
import { err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import { BaseId } from '../domain/base/BaseId';
import { domainError, type DomainError } from '../domain/shared/DomainError';
import { TableId } from '../domain/table/TableId';
import { ViewId } from '../domain/table/views/ViewId';
import { TableUpdateCommand } from './TableUpdateCommand';

export const updateViewGroupCommandInputSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  group: groupSchema,
});

export type IUpdateViewGroupCommandInput = z.input<typeof updateViewGroupCommandInputSchema>;

export class UpdateViewGroupCommand extends TableUpdateCommand {
  private constructor(
    baseId: BaseId,
    tableId: TableId,
    readonly viewId: ViewId,
    readonly group: z.output<typeof groupSchema>
  ) {
    super(baseId, tableId);
  }

  static create(raw: unknown): Result<UpdateViewGroupCommand, DomainError> {
    const parsed = updateViewGroupCommandInputSchema.safeParse(raw);
    if (!parsed.success) {
      return err(
        domainError.validation({
          message: 'Invalid UpdateViewGroupCommand input',
          details: z.formatError(parsed.error),
        })
      );
    }

    return BaseId.create(parsed.data.baseId).andThen((baseId) =>
      TableId.create(parsed.data.tableId).andThen((tableId) =>
        ViewId.create(parsed.data.viewId).map(
          (viewId) => new UpdateViewGroupCommand(baseId, tableId, viewId, parsed.data.group)
        )
      )
    );
  }
}
