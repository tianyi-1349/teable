import { err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import { BaseId } from '../domain/base/BaseId';
import { domainError, type DomainError } from '../domain/shared/DomainError';
import { TableId } from '../domain/table/TableId';
import { ViewId } from '../domain/table/views/ViewId';
import { TableUpdateCommand } from './TableUpdateCommand';

export const updateViewDescriptionCommandInputSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  description: z.string(),
});

export class UpdateViewDescriptionCommand extends TableUpdateCommand {
  private constructor(
    baseId: BaseId,
    tableId: TableId,
    readonly viewId: ViewId,
    readonly description: string
  ) {
    super(baseId, tableId);
  }

  static create(raw: unknown): Result<UpdateViewDescriptionCommand, DomainError> {
    const parsed = updateViewDescriptionCommandInputSchema.safeParse(raw);
    if (!parsed.success) {
      return err(domainError.validation({ message: 'Invalid UpdateViewDescriptionCommand input' }));
    }

    return BaseId.create(parsed.data.baseId).andThen((baseId) =>
      TableId.create(parsed.data.tableId).andThen((tableId) =>
        ViewId.create(parsed.data.viewId).map(
          (viewId) =>
            new UpdateViewDescriptionCommand(baseId, tableId, viewId, parsed.data.description)
        )
      )
    );
  }
}
