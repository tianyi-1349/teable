import { CellValueType, DbFieldType, FieldType, Relationship } from '@teable/core';
import { render, screen } from '@/test-utils';
import { FieldSettingBase } from './FieldSetting';
import { FieldOperator } from './type';

vi.mock('./DynamicFieldEditor', () => ({
  DynamicFieldEditor: ({
    field,
  }: {
    field: { name?: string; type?: string; isLookup?: boolean };
  }) => (
    <div data-testid="dynamic-field-editor">
      <span data-testid="editor-field-name">{field.name ?? ''}</span>
      <span data-testid="editor-field-type">{field.type ?? ''}</span>
      <span data-testid="editor-field-is-lookup">{field.isLookup ? 'true' : 'false'}</span>
    </div>
  ),
}));

describe('FieldSettingBase', () => {
  it('hydrates local editor state when originField arrives after initial fallback render', () => {
    const lookupField = {
      id: 'fldLookup0000000001',
      name: 'Lookup Child Name',
      type: FieldType.SingleLineText,
      description: undefined,
      options: {},
      isLookup: true,
      lookupOptions: {
        relationship: Relationship.ManyOne,
        foreignTableId: 'tblForeign000000001',
        linkFieldId: 'fldLink000000000001',
        lookupFieldId: 'fldTarget0000000001',
        fkHostTableName: 'tbl_lookup_host',
        selfKeyName: '__id',
        foreignKeyName: '__fk_fldLink000000000001',
      },
      cellValueType: CellValueType.String,
      isMultipleCellValue: false,
      dbFieldType: DbFieldType.Text,
      dbFieldName: 'Lookup_Child_Name',
    } as const;

    const { rerender } = render(
      <FieldSettingBase
        visible
        field={undefined}
        operator={FieldOperator.Edit}
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
    );

    expect(screen.getByTestId('editor-field-type')).toHaveTextContent(FieldType.SingleLineText);
    expect(screen.getByTestId('editor-field-name')).toHaveTextContent('');
    expect(screen.getByTestId('editor-field-is-lookup')).toHaveTextContent('false');

    rerender(
      <FieldSettingBase
        visible
        field={lookupField}
        operator={FieldOperator.Edit}
        onCancel={() => undefined}
        onConfirm={() => undefined}
      />
    );

    expect(screen.getByTestId('editor-field-name')).toHaveTextContent('Lookup Child Name');
    expect(screen.getByTestId('editor-field-type')).toHaveTextContent(FieldType.SingleLineText);
    expect(screen.getByTestId('editor-field-is-lookup')).toHaveTextContent('true');
  });
});
