import { err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import { BaseId } from '../domain/base/BaseId';
import { domainError, type DomainError } from '../domain/shared/DomainError';
import { TableId } from '../domain/table/TableId';
import { ViewId } from '../domain/table/views/ViewId';
import { TableUpdateCommand } from './TableUpdateCommand';

export const updateViewOrderCommandInputSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  anchorId: z.string(),
  position: z.enum(['before', 'after']),
});

export class UpdateViewOrderCommand extends TableUpdateCommand {
  private constructor(
    baseId: BaseId,
    tableId: TableId,
    readonly viewId: ViewId,
    readonly anchorId: ViewId,
    readonly position: 'before' | 'after'
  ) {
    super(baseId, tableId);
  }

  static create(raw: unknown): Result<UpdateViewOrderCommand, DomainError> {
    const parsed = updateViewOrderCommandInputSchema.safeParse(raw);
    if (!parsed.success) {
      return err(domainError.validation({ message: 'Invalid UpdateViewOrderCommand input' }));
    }

    return BaseId.create(parsed.data.baseId).andThen((baseId) =>
      TableId.create(parsed.data.tableId).andThen((tableId) =>
        ViewId.create(parsed.data.viewId).andThen((viewId) =>
          ViewId.create(parsed.data.anchorId).map(
            (anchorId) =>
              new UpdateViewOrderCommand(baseId, tableId, viewId, anchorId, parsed.data.position)
          )
        )
      )
    );
  }
}
