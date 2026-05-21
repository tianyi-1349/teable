import {
  FieldType,
  isImage,
  isPdf,
  type FieldKeyType,
  type IAttachmentCellValue,
  type IRecord,
  type ISnapshotBase,
} from '@teable/core';
import {
  generateTableThumbnailPath,
  getTableThumbnailToken,
} from '../../utils/generate-thumbnail-path';

type IFieldKeySource = {
  type: FieldType;
  [FieldKeyType.Id]: string;
  [FieldKeyType.Name]: string;
  [FieldKeyType.DbFieldName]: string;
};

function listAttachmentItems(
  records: ISnapshotBase<IRecord>[],
  fields: IFieldKeySource[],
  fieldKeyType: FieldKeyType
) {
  return fields.flatMap((field) => {
    if (field.type !== FieldType.Attachment) {
      return [];
    }

    const fieldKey = field[fieldKeyType];
    return records.flatMap((record) => {
      const cellValue = record.data.fields[fieldKey] as IAttachmentCellValue | null | undefined;
      return cellValue ?? [];
    });
  });
}

export function collectAttachmentPreviewTokens(
  records: ISnapshotBase<IRecord>[],
  fields: IFieldKeySource[],
  fieldKeyType: FieldKeyType
) {
  const tokens = new Set<string>();

  listAttachmentItems(records, fields, fieldKeyType).forEach((item) => {
    if (item.mimetype.startsWith('image/') && item.width && item.height) {
      const { smThumbnailPath, lgThumbnailPath } = generateTableThumbnailPath(item.path);
      tokens.add(getTableThumbnailToken(smThumbnailPath));
      tokens.add(getTableThumbnailToken(lgThumbnailPath));
    }
    tokens.add(item.token);
  });

  return Array.from(tokens);
}

export function collectAttachmentThumbnailTokens(
  records: ISnapshotBase<IRecord>[],
  fields: IFieldKeySource[],
  fieldKeyType: FieldKeyType
) {
  const tokens = new Set<string>();

  listAttachmentItems(records, fields, fieldKeyType).forEach((item) => {
    if (isImage(item.mimetype) || isPdf(item.mimetype)) {
      tokens.add(getTableThumbnailToken(item.token));
    }
  });

  return Array.from(tokens);
}

export function chunkTokens(tokens: string[], size: number) {
  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += size) {
    chunks.push(tokens.slice(i, i + size));
  }
  return chunks;
}

export function decorateAttachmentValue(
  item: IAttachmentCellValue[number],
  urls: {
    presignedUrl: string;
    smThumbnailUrl?: string;
    lgThumbnailUrl?: string;
  }
) {
  const isImg = isImage(item.mimetype);

  return {
    ...item,
    presignedUrl: urls.presignedUrl,
    smThumbnailUrl: isImg ? urls.smThumbnailUrl || urls.presignedUrl : urls.smThumbnailUrl,
    lgThumbnailUrl: isImg ? urls.lgThumbnailUrl || urls.presignedUrl : urls.lgThumbnailUrl,
  };
}

export async function decorateRecordsAttachmentFields(
  records: ISnapshotBase<IRecord>[],
  fields: IFieldKeySource[],
  fieldKeyType: FieldKeyType,
  decorateCellValue: (
    cellValue: IAttachmentCellValue | null
  ) => Promise<IAttachmentCellValue | null>
) {
  for (const field of fields) {
    if (field.type !== FieldType.Attachment) {
      continue;
    }

    const fieldKey = field[fieldKeyType];
    for (const record of records) {
      const cellValue = record.data.fields[fieldKey] as IAttachmentCellValue | null;
      const decoratedCellValue = await decorateCellValue(cellValue);
      if (decoratedCellValue != null) {
        record.data.fields[fieldKey] = decoratedCellValue;
      }
    }
  }

  return records;
}
