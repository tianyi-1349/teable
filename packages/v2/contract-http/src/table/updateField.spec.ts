import { BaseId, FieldId, FieldUpdated, TableId } from '@teable/v2-core';
import { describe, expect, it } from 'vitest';

import { serializeFieldUpdatedChangeValue, updateFieldEventDtoSchema } from './updateField';

describe('updateFieldEventDtoSchema', () => {
  it('accepts serialized field changes with undefined object entries omitted', () => {
    const event = FieldUpdated.create({
      tableId: TableId.generate()._unsafeUnwrap(),
      baseId: BaseId.generate()._unsafeUnwrap(),
      fieldId: FieldId.mustGenerate(),
      updatedProperties: ['options'],
      changes: {
        options: {
          oldValue: { lookupFieldId: undefined },
          newValue: { lookupFieldId: FieldId.mustGenerate() },
        },
      },
    });

    const oldValue = serializeFieldUpdatedChangeValue(event.changes.options.oldValue);
    const newValue = serializeFieldUpdatedChangeValue(event.changes.options.newValue);

    expect(oldValue).toEqual({});
    expect(newValue).toEqual({
      lookupFieldId: event.changes.options.newValue.lookupFieldId?.toString(),
    });

    const mapped = updateFieldEventDtoSchema.safeParse({
      name: event.name.toString(),
      occurredAt: event.occurredAt.toString(),
      tableId: event.tableId.toString(),
      baseId: event.baseId.toString(),
      fieldId: event.fieldId.toString(),
      updatedProperties: [...event.updatedProperties],
      changes: {
        options: {
          oldValue,
          newValue,
        },
      },
    });

    expect(mapped.success).toBe(true);
  });
});
