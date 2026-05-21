import { FieldType } from '@teable/core';
import type { IFieldInstance } from '@teable/sdk/model';

export const generateUniqLocalKey = (tableId?: string, viewId?: string) => `${tableId}-${viewId}`;

export const isProtectedField = (field: IFieldInstance) => {
  const { options, notNull } = field;
  const defaultValue = (options as { defaultValue?: string })?.defaultValue;
  return Boolean(notNull) && !defaultValue;
};

export const getLocalizedDefaultFieldName = (
  field: IFieldInstance,
  t: (key: string) => unknown
): string | undefined => {
  const legacyNamesByType: Partial<Record<FieldType, string[]>> = {
    [FieldType.SingleLineText]: ['Single line text', 'Label', 'Name'],
    [FieldType.LongText]: ['Long text', 'Notes'],
    [FieldType.Number]: ['Number', 'Count'],
    [FieldType.Rating]: ['Rating'],
    [FieldType.SingleSelect]: ['Single select', 'Select', 'Status'],
    [FieldType.MultipleSelect]: ['Multiple select', 'Tags'],
    [FieldType.Checkbox]: ['Checkbox', 'Done'],
    [FieldType.Attachment]: ['Attachment', 'Attachments'],
    [FieldType.Date]: ['Date'],
    [FieldType.User]: ['User', 'Collaborator', 'Collaborators'],
    [FieldType.CreatedTime]: ['Created time', 'Created Time'],
    [FieldType.LastModifiedTime]: ['Last modified time', 'Last Modified Time'],
    [FieldType.CreatedBy]: ['Created by', 'Created By'],
    [FieldType.LastModifiedBy]: ['Last modified by', 'Last Modified By'],
    [FieldType.AutoNumber]: ['ID', 'Auto Number'],
    [FieldType.Button]: ['Button'],
    [FieldType.Formula]: ['Formula', 'Calculation'],
  };

  const localizedNameKeyByType: Partial<Record<FieldType, string>> = {
    [FieldType.SingleLineText]: 'field.default.singleLineText.title',
    [FieldType.LongText]: 'field.default.longText.title',
    [FieldType.Number]: 'field.default.number.title',
    [FieldType.Rating]: 'field.default.rating.title',
    [FieldType.SingleSelect]: 'field.default.singleSelect.title',
    [FieldType.MultipleSelect]: 'field.default.multipleSelect.title',
    [FieldType.Checkbox]: 'field.default.checkbox.title',
    [FieldType.Attachment]: 'field.default.attachment.title',
    [FieldType.Date]: 'field.default.date.title',
    [FieldType.User]: 'field.default.user.title',
    [FieldType.CreatedTime]: 'field.default.createdTime.title',
    [FieldType.LastModifiedTime]: 'field.default.lastModifiedTime.title',
    [FieldType.CreatedBy]: 'field.default.createdBy.title',
    [FieldType.LastModifiedBy]: 'field.default.lastModifiedBy.title',
    [FieldType.AutoNumber]: 'field.default.autoNumber.title',
    [FieldType.Button]: 'field.default.button.title',
    [FieldType.Formula]: 'field.default.formula.title',
  };

  const matchedLegacyNames = legacyNamesByType[field.type];
  const localizedNameKey = localizedNameKeyByType[field.type];
  if (!field.name || !localizedNameKey) {
    return undefined;
  }

  const shouldLocalize =
    matchedLegacyNames?.includes(field.name) ||
    field.name === localizedNameKey ||
    field.name === `table:${localizedNameKey}`;

  if (!shouldLocalize) {
    return undefined;
  }

  return String(t(`table:${localizedNameKey}`));
};
