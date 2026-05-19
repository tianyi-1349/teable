import { err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import { BaseId } from '../domain/base/BaseId';
import { domainError, type DomainError } from '../domain/shared/DomainError';
import { TableId } from '../domain/table/TableId';
import { ViewId } from '../domain/table/views/ViewId';
import { TableUpdateCommand } from './TableUpdateCommand';

export const updateViewLockedCommandInputSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  isLocked: z.boolean().optional(),
});

export class UpdateViewLockedCommand extends TableUpdateCommand {
  private constructor(
    baseId: BaseId,
    tableId: TableId,
    readonly viewId: ViewId,
    readonly isLocked: boolean | undefined
  ) {
    super(baseId, tableId);
  }

  static create(raw: unknown): Result<UpdateViewLockedCommand, DomainError> {
    const parsed = updateViewLockedCommandInputSchema.safeParse(raw);
    if (!parsed.success) {
      return err(domainError.validation({ message: 'Invalid UpdateViewLockedCommand input' }));
    }

    return BaseId.create(parsed.data.baseId).andThen((baseId) =>
      TableId.create(parsed.data.tableId).andThen((tableId) =>
        ViewId.create(parsed.data.viewId).map(
          (viewId) => new UpdateViewLockedCommand(baseId, tableId, viewId, parsed.data.isLocked)
        )
      )
    );
  }
}
