import { err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import { BaseId } from '../domain/base/BaseId';
import { domainError, type DomainError } from '../domain/shared/DomainError';
import { TableId } from '../domain/table/TableId';
import { ViewId } from '../domain/table/views/ViewId';
import { ViewName } from '../domain/table/views/ViewName';
import { TableUpdateCommand } from './TableUpdateCommand';

export const updateViewNameCommandInputSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  name: z.string(),
});

export class UpdateViewNameCommand extends TableUpdateCommand {
  private constructor(
    baseId: BaseId,
    tableId: TableId,
    readonly viewId: ViewId,
    readonly name: ViewName
  ) {
    super(baseId, tableId);
  }

  static create(raw: unknown): Result<UpdateViewNameCommand, DomainError> {
    const parsed = updateViewNameCommandInputSchema.safeParse(raw);
    if (!parsed.success) {
      return err(domainError.validation({ message: 'Invalid UpdateViewNameCommand input' }));
    }

    return BaseId.create(parsed.data.baseId).andThen((baseId) =>
      TableId.create(parsed.data.tableId).andThen((tableId) =>
        ViewId.create(parsed.data.viewId).andThen((viewId) =>
          ViewName.create(parsed.data.name).map(
            (name) => new UpdateViewNameCommand(baseId, tableId, viewId, name)
          )
        )
      )
    );
  }
}
