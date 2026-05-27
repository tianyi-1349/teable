import type { TableRecordReadModel, DomainError } from '@teable/v2-core';
import { ok } from 'neverthrow';
import type { Result } from 'neverthrow';
import { z } from 'zod';

import { jsonValueSchema, toJsonRecord } from '../shared/json';

export const tableRecordDtoSchema = z.object({
  id: z.string(),
  fields: z.record(z.string(), jsonValueSchema),
});

export interface ITableRecordDto {
  id: string;
  fields: Record<string, unknown>;
}

export const mapTableRecordToDto = (
  record: TableRecordReadModel
): Result<ITableRecordDto, DomainError> => {
  return ok({ id: record.id, fields: toJsonRecord(record.fields) });
};
