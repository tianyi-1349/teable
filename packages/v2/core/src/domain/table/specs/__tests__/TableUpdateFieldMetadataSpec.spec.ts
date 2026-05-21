import { describe, expect, it } from 'vitest';

import { BaseId } from '../../../base/BaseId';
import { Table } from '../../Table';
import { TableName } from '../../TableName';
import { DbFieldName } from '../../fields/DbFieldName';
import { FieldId } from '../../fields/FieldId';
import { FieldName } from '../../fields/FieldName';
import { FieldHasError } from '../../fields/types/FieldHasError';
import { TableUpdateFieldDbFieldNameSpec } from '../TableUpdateFieldDbFieldNameSpec';
import { TableUpdateFieldHasErrorSpec } from '../TableUpdateFieldHasErrorSpec';

const createBaseId = (seed: string) => BaseId.create(`bse${seed.repeat(16)}`)._unsafeUnwrap();
const createFieldId = (seed: string) => FieldId.create(`fld${seed.repeat(16)}`)._unsafeUnwrap();

const buildTable = (fieldId: FieldId) => {
  const builder = Table.builder()
    .withBaseId(createBaseId('m'))
    .withName(TableName.create('Metadata')._unsafeUnwrap());
  builder.field().singleLineText().withName(FieldName.create('Title')._unsafeUnwrap()).done();
  builder
    .field()
    .singleLineText()
    .withId(fieldId)
    .withName(FieldName.create('Notes')._unsafeUnwrap())
    .done();
  builder.view().defaultGrid().done();
  return builder.build()._unsafeUnwrap();
};

describe('Table field metadata updates are immutable', () => {
  it('updates db field name immutably', () => {
    const fieldId = createFieldId('1');
    const table = buildTable(fieldId);
    const field = table.getField((f) => f.id().equals(fieldId))._unsafeUnwrap();
    const previousDbFieldName = DbFieldName.rehydrate('fld_notes')._unsafeUnwrap();
    field.setDbFieldName(previousDbFieldName)._unsafeUnwrap();

    const nextDbFieldName = DbFieldName.rehydrate('fld_notes_renamed')._unsafeUnwrap();
    const spec = TableUpdateFieldDbFieldNameSpec.create(
      fieldId,
      previousDbFieldName,
      nextDbFieldName
    );

    const updated = spec.mutate(table)._unsafeUnwrap();
    const originalField = table.getField((f) => f.id().equals(fieldId))._unsafeUnwrap();
    const updatedField = updated.getField((f) => f.id().equals(fieldId))._unsafeUnwrap();

    expect(updated).not.toBe(table);
    expect(updatedField).not.toBe(originalField);
    expect(originalField.dbFieldName()._unsafeUnwrap().value()._unsafeUnwrap()).toBe('fld_notes');
    expect(updatedField.dbFieldName()._unsafeUnwrap().value()._unsafeUnwrap()).toBe(
      'fld_notes_renamed'
    );
  });

  it('updates hasError immutably', () => {
    const fieldId = createFieldId('2');
    const table = buildTable(fieldId);
    const field = table.getField((f) => f.id().equals(fieldId))._unsafeUnwrap();
    expect(field.hasError().isError()).toBe(false);

    const spec = TableUpdateFieldHasErrorSpec.setError(fieldId, FieldHasError.ok());
    const updated = spec.mutate(table)._unsafeUnwrap();
    const originalField = table.getField((f) => f.id().equals(fieldId))._unsafeUnwrap();
    const updatedField = updated.getField((f) => f.id().equals(fieldId))._unsafeUnwrap();

    expect(updated).not.toBe(table);
    expect(updatedField).not.toBe(originalField);
    expect(originalField.hasError().isError()).toBe(false);
    expect(updatedField.hasError().isError()).toBe(true);
  });
});
