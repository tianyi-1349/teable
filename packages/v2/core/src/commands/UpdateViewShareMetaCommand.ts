import { shareViewMetaSchema } from '@teable/core';
import { err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import { BaseId } from '../domain/base/BaseId';
import { domainError, type DomainError } from '../domain/shared/DomainError';
import { TableId } from '../domain/table/TableId';
import { ViewId } from '../domain/table/views/ViewId';
import { TableUpdateCommand } from './TableUpdateCommand';

export const updateViewShareMetaCommandInputSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  shareMeta: shareViewMetaSchema,
});

export class UpdateViewShareMetaCommand extends TableUpdateCommand {
  private constructor(
    baseId: BaseId,
    tableId: TableId,
    readonly viewId: ViewId,
    readonly shareMeta: z.output<typeof shareViewMetaSchema>
  ) {
    super(baseId, tableId);
  }

  static create(raw: unknown): Result<UpdateViewShareMetaCommand, DomainError> {
    const parsed = updateViewShareMetaCommandInputSchema.safeParse(raw);
    if (!parsed.success) {
      return err(domainError.validation({ message: 'Invalid UpdateViewShareMetaCommand input' }));
    }

    return BaseId.create(parsed.data.baseId).andThen((baseId) =>
      TableId.create(parsed.data.tableId).andThen((tableId) =>
        ViewId.create(parsed.data.viewId).map(
          (viewId) => new UpdateViewShareMetaCommand(baseId, tableId, viewId, parsed.data.shareMeta)
        )
      )
    );
  }
}
