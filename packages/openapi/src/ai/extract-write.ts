import { FieldType } from '@teable/core';
import { z } from '../zod';

export const aiExtractWritableFieldTypeSchema = z.enum([
  FieldType.SingleLineText,
  FieldType.LongText,
  FieldType.Date,
  FieldType.Number,
  FieldType.Rating,
  FieldType.Checkbox,
  FieldType.Attachment,
  FieldType.SingleSelect,
  FieldType.MultipleSelect,
]);

export const aiExtractWritePreviewRoSchema = z.object({
  tableId: z.string(),
  recordId: z.string().optional(),
  fieldIds: z.array(z.string()).optional(),
  sourceText: z.string(),
  instructions: z.string().optional(),
  modelKey: z.string().optional(),
});

export type IAiExtractWritePreviewRo = z.infer<typeof aiExtractWritePreviewRoSchema>;

export const aiExtractWritePreviewFieldSchema = z.object({
  fieldId: z.string(),
  name: z.string(),
  type: z.string(),
  status: z.enum(['filled', 'empty', 'invalid', 'unsupported']),
  value: z.unknown().optional(),
  reason: z.string().optional(),
  choices: z.array(z.string()).optional(),
  existingAttachments: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
      })
    )
    .optional(),
  keepExistingAttachmentIds: z.array(z.string()).optional(),
});

export type IAiExtractWritePreviewField = z.infer<typeof aiExtractWritePreviewFieldSchema>;

export const aiExtractWritePreviewVoSchema = z.object({
  action: z.enum(['create', 'update']),
  tableId: z.string(),
  recordId: z.string().optional(),
  fields: z.array(aiExtractWritePreviewFieldSchema),
  warnings: z.array(z.string()),
});

export type IAiExtractWritePreviewVo = z.infer<typeof aiExtractWritePreviewVoSchema>;

export const aiExtractWriteApplyRoSchema = z.object({
  tableId: z.string(),
  recordId: z.string().optional(),
  fields: z.array(
    z.object({
      fieldId: z.string(),
      name: z.string().optional(),
      type: z.string().optional(),
      value: z.unknown(),
      keepExistingAttachmentIds: z.array(z.string()).optional(),
    })
  ),
});

export type IAiExtractWriteApplyRo = z.infer<typeof aiExtractWriteApplyRoSchema>;

export const aiExtractWriteApplyVoSchema = z.object({
  operation: z.unknown(),
  appliedFieldIds: z.array(z.string()),
});

export type IAiExtractWriteApplyVo = z.infer<typeof aiExtractWriteApplyVoSchema>;
