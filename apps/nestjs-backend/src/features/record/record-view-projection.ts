import type { FieldKeyType, IColumnMeta } from '@teable/core';

type IFieldKeySource = {
  id: string;
} & Record<string, unknown>;

export function buildViewProjection(
  columnMeta: IColumnMeta,
  fields: IFieldKeySource[],
  fieldKeyType: FieldKeyType
): Record<string, boolean> | undefined {
  const useVisible = Object.values(columnMeta).some((column) => 'visible' in column);
  const useHidden = Object.values(columnMeta).some((column) => 'hidden' in column);

  if (!useVisible && !useHidden) {
    return undefined;
  }

  const fieldMap = Object.fromEntries(fields.map((field) => [field.id, field]));

  const projection = Object.entries(columnMeta).reduce<Record<string, boolean>>(
    (acc, [fieldId, column]) => {
      const field = fieldMap[fieldId];
      if (!field) {
        return acc;
      }

      const fieldKey = field[fieldKeyType] as string | undefined;
      if (!fieldKey) {
        return acc;
      }

      if (useVisible) {
        if ('visible' in column && column.visible) {
          acc[fieldKey] = true;
        }
        return acc;
      }

      if (!('hidden' in column) || !column.hidden) {
        acc[fieldKey] = true;
      }

      return acc;
    },
    {}
  );

  return Object.keys(projection).length ? projection : undefined;
}
