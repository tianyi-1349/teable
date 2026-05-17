import { err } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import { BaseId } from '../domain/base/BaseId';
import { domainError, type DomainError } from '../domain/shared/DomainError';
import { TableId } from '../domain/table/TableId';
import { ViewId } from '../domain/table/views/ViewId';
import { recordFilterSchema, type RecordFilter } from '../queries/RecordFilterDto';
import { TableUpdateCommand } from './TableUpdateCommand';

export const updateViewFilterCommandInputSchema = z.object({
  baseId: z.string(),
  tableId: z.string(),
  viewId: z.string(),
  filter: recordFilterSchema,
});

export type IUpdateViewFilterCommandInput = z.input<typeof updateViewFilterCommandInputSchema>;

export class UpdateViewFilterCommand extends TableUpdateCommand {
  private constructor(
    baseId: BaseId,
    tableId: TableId,
    readonly viewId: ViewId,
    readonly filter: RecordFilter | null
  ) {
    super(baseId, tableId);
  }

  static create(raw: unknown): Result<UpdateViewFilterCommand, DomainError> {
    const parsed = updateViewFilterCommandInputSchema.safeParse(raw);
    if (!parsed.success) {
      return err(
        domainError.validation({
          message: 'Invalid UpdateViewFilterCommand input',
          details: z.formatError(parsed.error),
        })
      );
    }

    return BaseId.create(parsed.data.baseId).andThen((baseId) =>
      TableId.create(parsed.data.tableId).andThen((tableId) =>
        ViewId.create(parsed.data.viewId).map(
          (viewId) => new UpdateViewFilterCommand(baseId, tableId, viewId, parsed.data.filter)
        )
      )
    );
  }
}
