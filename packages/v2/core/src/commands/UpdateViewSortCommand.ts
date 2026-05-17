import { sortSchema } from '@teable/core';
import { err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import { BaseId } from '../domain/base/BaseId';
import { domainError, type DomainError } from '../domain/shared/DomainError';
import { TableId } from '../domain/table/TableId';
import { ViewId } from '../domain/table/views/ViewId';
import { TableUpdateCommand } from './TableUpdateCommand';

export const updateViewSortCommandInputSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  sort: sortSchema,
});

export type IUpdateViewSortCommandInput = z.input<typeof updateViewSortCommandInputSchema>;

export class UpdateViewSortCommand extends TableUpdateCommand {
  private constructor(
    baseId: BaseId,
    tableId: TableId,
    readonly viewId: ViewId,
    readonly sort: z.output<typeof sortSchema>
  ) {
    super(baseId, tableId);
  }

  static create(raw: unknown): Result<UpdateViewSortCommand, DomainError> {
    const parsed = updateViewSortCommandInputSchema.safeParse(raw);
    if (!parsed.success) {
      return err(
        domainError.validation({
          message: 'Invalid UpdateViewSortCommand input',
          details: z.formatError(parsed.error),
        })
      );
    }

    return BaseId.create(parsed.data.baseId).andThen((baseId) =>
      TableId.create(parsed.data.tableId).andThen((tableId) =>
        ViewId.create(parsed.data.viewId).map(
          (viewId) => new UpdateViewSortCommand(baseId, tableId, viewId, parsed.data.sort)
        )
      )
    );
  }
}
