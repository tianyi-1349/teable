import type { IColumnMeta } from '@teable/core';

export const isFieldVisible = (columnMeta: IColumnMeta | undefined, fieldId: string) => {
  if (!columnMeta) {
    return true;
  }

  const fieldMeta = columnMeta[fieldId];
  if (fieldMeta == null) {
    return true;
  }

  if ('visible' in fieldMeta) {
    return fieldMeta.visible !== false;
  }

  if ('hidden' in fieldMeta) {
    return fieldMeta.hidden !== true;
  }

  return true;
};
