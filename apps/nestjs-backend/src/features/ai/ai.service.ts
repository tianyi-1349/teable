/* eslint-disable sonarjs/no-duplicate-string */
import type { OpenAIProvider } from '@ai-sdk/openai';
import { Injectable, Logger } from '@nestjs/common';
import type { IAttachmentItem, IColumnMeta, IFilter, IGroup, ISortItem } from '@teable/core';
import {
  FieldKeyType,
  FieldType,
  HttpErrorCode,
  IdPrefix,
  SingleLineTextDisplayType,
} from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import {
  AiStreamErrorCode,
  aiExtractWritableFieldTypeSchema,
  IntegrationType,
  LLMProviderType,
  SettingKey,
  Task,
  convertGatewayApiModel,
  normalizeGatewayPricing,
} from '@teable/openapi';
import type {
  IAIConfig,
  IAiExtractWriteApplyRo,
  IAiExtractWriteApplyVo,
  IAiExtractWritePreviewField,
  IAiExtractWritePreviewRo,
  IAiExtractWritePreviewVo,
  IAiGenerateRo,
  IAiRecordOperationRo,
  IAiRecordOperationVo,
  IAiViewContextField,
  IAiViewContextQuery,
  IChatModelAbility,
  IGatewayApiModel,
  IGatewayApiModelRaw,
  IGetAIConfig,
  IGetNativeAICapabilitiesQuery,
  IAiViewContextVo,
  IQueryNativeAICapabilitiesRo,
  GatewayModelTag,
  LLMProvider,
} from '@teable/openapi';
import type { ImageModel, LanguageModel } from 'ai';
import { createGateway, generateText, streamText } from 'ai';
import axios from 'axios';
import { difference } from 'lodash';
import type { Response } from 'express';
import { BaseConfig, IBaseConfig } from '../../configs/base.config';
import { CustomHttpException } from '../../custom.exception';
import { PerformanceCacheService } from '../../performance-cache';
import { PermissionService } from '../auth/permission.service';
import { RecordOpenApiService } from '../record/open-api/record-open-api.service';
import { RecordService } from '../record/record.service';
import { SettingService } from '../setting/setting.service';
import {
  createAiStreamError,
  getAiStreamErrorMessage,
  handleAiStreamErrorResponse,
} from './stream-error.helper';
import {
  buildNativeCapabilitiesVo,
  filterNativeCapabilities,
  queryNativeCapabilities,
  resolveNativeCapabilities,
} from './native-capability';
import { isFieldVisible } from './view-context.helper';
import { getAdaptedProviderOptions, getTaskModelKey, modelProviders } from './util';

// Fixed name for all instance (platform-provided) providers in modelKey.
// Instance models always end with @teable (e.g. "aiGateway@model@teable", "anthropic@model@teable").
// BYOK (space-configured) providers keep their custom name (e.g. "openai@model@my-custom").
export const INSTANCE_PROVIDER_NAME = 'teable';

export type ILanguageModelV2 = Exclude<LanguageModel, string>;

type IExtractSupportedFieldType =
  (typeof aiExtractWritableFieldTypeSchema)['enum'][keyof (typeof aiExtractWritableFieldTypeSchema)['enum']];

type IExtractField = {
  id: string;
  name: string;
  type: FieldType;
  options?: string | null;
  isComputed?: boolean | null;
};

type ITextShowAsType = SingleLineTextDisplayType | 'barcode' | 'qrcode' | null;

type IAttachmentApplyValue = {
  keepAttachmentIds: string[];
  urls: string[];
};

const AI_EXTRACT_SUPPORTED_FIELD_TYPES = new Set<FieldType>(
  Object.values(aiExtractWritableFieldTypeSchema.enum)
);

// In-memory cache for Gateway models (TTL: 10 minutes)
const gatewayModelsCacheTtl = 10 * 60 * 1000;

interface IGatewayModelsCache {
  data: IGatewayApiModel[];
  expiresAt: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  // In-memory cache for Gateway models API - faster than Redis for static data
  private gatewayModelsCache: IGatewayModelsCache | null = null;

  constructor(
    private readonly settingService: SettingService,
    private readonly prismaService: PrismaService,
    @BaseConfig() private readonly baseConfig: IBaseConfig,
    private readonly performanceCacheService: PerformanceCacheService,
    private readonly recordService: RecordService,
    private readonly recordOpenApiService: RecordOpenApiService,
    private readonly permissionService: PermissionService
  ) {}

  private async assertTableInBase(baseId: string, tableId: string) {
    await this.prismaService.tableMeta.findFirstOrThrow({
      where: {
        id: tableId,
        baseId,
        deletedTime: null,
      },
      select: { id: true },
    });
  }

  async recordOperation(baseId: string, body: IAiRecordOperationRo): Promise<IAiRecordOperationVo> {
    const { action, tableId } = body;
    await this.assertTableInBase(baseId, tableId);

    if (action === 'create') {
      await this.permissionService.validPermissions(tableId, ['record|create']);
      const result = await this.recordOpenApiService.multipleCreateRecords(
        tableId,
        body.payload,
        undefined,
        'true'
      );

      return {
        action,
        tableId,
        records: result.records,
      };
    }

    if (action === 'update') {
      await this.permissionService.validPermissions(tableId, ['record|update']);
      const recordIds = body.payload.records.map((record) => record.id);
      await this.assertRecordsExist(tableId, recordIds);

      const result = await this.recordOpenApiService.updateRecords(
        tableId,
        body.payload,
        undefined,
        'true'
      );

      return {
        action,
        tableId,
        records: result.records,
      };
    }

    await this.permissionService.validPermissions(tableId, ['record|delete']);
    await this.assertRecordsExist(tableId, body.payload.recordIds);
    await this.recordOpenApiService.deleteRecords(tableId, body.payload.recordIds);

    return {
      action,
      tableId,
      deletedRecordIds: body.payload.recordIds,
    };
  }

  private async assertRecordsExist(tableId: string, recordIds: string[]) {
    if (!recordIds.length) {
      return;
    }

    const records = await this.recordService.getRecords(
      tableId,
      {
        selectedRecordIds: recordIds,
        fieldKeyType: FieldKeyType.Id,
        projection: [],
      },
      true
    );
    const existingIds = records.records.map((record) => record.id);
    const missingIds = difference(recordIds, existingIds);
    if (missingIds.length) {
      throw new CustomHttpException(
        `Some records cannot be found, ids: ${missingIds.join(',')}`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }
  }

  private parseJsonString<T>(value?: string | null): T | undefined {
    if (!value) {
      return undefined;
    }

    return JSON.parse(value) as T;
  }

  private parseAiJson(text: string): Record<string, unknown> {
    const trimmed = text.trim();
    const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fencedMatch?.[1]?.trim() ?? trimmed;

    try {
      const parsed = JSON.parse(candidate) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      // Fallback to object slice parsing below.
    }

    const firstBrace = candidate.indexOf('{');
    const lastBrace = candidate.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      const objectSlice = candidate.slice(firstBrace, lastBrace + 1);
      const parsed = JSON.parse(objectSlice) as unknown;
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    }

    throw new CustomHttpException('AI response is not valid JSON', HttpErrorCode.VALIDATION_ERROR);
  }

  private buildExtractPrompt(
    fields: Array<IExtractField & { choices?: string[] }>,
    body: IAiExtractWritePreviewRo,
    readonlyContext?: string
  ) {
    const fieldLines = fields
      .map((field) => {
        const choicesText = field.choices?.length ? ` Choices: ${field.choices.join(', ')}.` : '';
        const formatText = this.getFieldFormatHint(field);
        return `- ${field.id} | ${field.name} | ${field.type}.${choicesText}${formatText}`;
      })
      .join('\n');

    return [
      'Extract structured values from the source text for the target fields below.',
      'Return strict JSON only. No markdown, no explanation, no code fences.',
      'The JSON keys must be field IDs. If a value is missing or uncertain, use null.',
      'Use exact choice names for select fields.',
      'Use arrays of exact choice names for multipleSelect fields.',
      'Use arrays of absolute file URLs for attachment fields.',
      'Use booleans for checkbox fields.',
      'Use numbers for number and rating fields.',
      'Use ISO 8601 strings for date fields when possible.',
      body.instructions ? `Additional instructions: ${body.instructions}` : null,
      `Operation: ${body.recordId ? 'update existing record' : 'create new record'}.`,
      readonlyContext ? `Current read-only field context:\n${readonlyContext}` : null,
      'Target fields:',
      fieldLines,
      'Source text:',
      body.sourceText,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  private getFieldChoices(field: IExtractField): string[] | undefined {
    if (field.type !== FieldType.SingleSelect && field.type !== FieldType.MultipleSelect) {
      return undefined;
    }

    const options = this.parseJsonString<{ choices?: Array<{ name?: string }> }>(field.options);
    return options?.choices
      ?.map((choice) => choice.name)
      .filter((name): name is string => Boolean(name));
  }

  private getTextShowAsType(field: IExtractField): ITextShowAsType {
    if (field.type !== FieldType.SingleLineText) {
      return null;
    }

    const options = this.parseJsonString<{
      showAs?: { type?: SingleLineTextDisplayType | string };
    }>(field.options);
    const showAsType = options?.showAs?.type;

    if (showAsType === 'barcode' || showAsType === 'qrcode') {
      return showAsType;
    }

    if (showAsType && Object.values(SingleLineTextDisplayType).includes(showAsType as never)) {
      return showAsType as SingleLineTextDisplayType;
    }

    return null;
  }

  private getFieldFormatHint(field: IExtractField): string {
    const showAsType = this.getTextShowAsType(field);
    if (!showAsType) {
      return '';
    }

    switch (showAsType) {
      case SingleLineTextDisplayType.Email:
        return ' Format: valid email address only.';
      case SingleLineTextDisplayType.Phone:
        return ' Format: valid phone number only.';
      case SingleLineTextDisplayType.Url:
        return ' Format: absolute http or https URL only.';
      case 'barcode':
        return ' Format: barcode content as plain text only.';
      case 'qrcode':
        return ' Format: QR code content as plain text only.';
      default:
        return '';
    }
  }

  private normalizeChoiceValue(value: unknown, choices: string[]): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    return choices.find((choice) => choice.toLowerCase() === trimmed.toLowerCase()) ?? null;
  }

  private normalizeMultipleChoiceValue(value: unknown, choices: string[]): string[] | null {
    if (!Array.isArray(value)) {
      return null;
    }

    const normalized = value
      .map((item) => this.normalizeChoiceValue(item, choices))
      .filter((item): item is string => Boolean(item));

    return normalized.length ? [...new Set(normalized)] : null;
  }

  private normalizeCheckboxValue(value: unknown): boolean | null {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const normalized = value.trim().toLowerCase();
    if (['true', 'yes', 'y', '1'].includes(normalized)) {
      return true;
    }

    if (['false', 'no', 'n', '0'].includes(normalized)) {
      return false;
    }

    return null;
  }

  private normalizeNumericValue(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value !== 'string') {
      return null;
    }

    const normalized = Number(value.replace(/,/g, '').trim());
    return Number.isFinite(normalized) ? normalized : null;
  }

  private normalizeStructuredTextValue(value: unknown, showAsType: ITextShowAsType): string | null {
    const normalized =
      typeof value === 'string'
        ? value.trim()
        : typeof value === 'number' && Number.isFinite(value)
          ? String(value).trim()
          : null;
    if (!normalized) {
      return null;
    }

    if (!showAsType) {
      return normalized;
    }

    switch (showAsType) {
      case SingleLineTextDisplayType.Email:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
      case SingleLineTextDisplayType.Phone: {
        const compact = normalized.replace(/[\s().-]/g, '');
        return /^\+?\d{6,20}$/.test(compact) ? normalized : null;
      }
      case SingleLineTextDisplayType.Url:
        try {
          const url = new URL(normalized);
          return ['http:', 'https:'].includes(url.protocol) ? normalized : null;
        } catch {
          return null;
        }
      case 'barcode':
      case 'qrcode':
        return normalized;
      default:
        return normalized;
    }
  }

  private normalizeAttachmentValue(value: unknown): string[] | null {
    const values = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value
            .split(/[\n,]/)
            .map((item) => item.trim())
            .filter(Boolean)
        : null;

    if (!values?.length) {
      return null;
    }

    const normalized = values.filter((item): item is string => {
      if (typeof item !== 'string') {
        return false;
      }

      try {
        const url = new URL(item);
        return ['http:', 'https:'].includes(url.protocol);
      } catch {
        return false;
      }
    });

    return normalized.length ? [...new Set(normalized)] : null;
  }

  private normalizeAttachmentKeepIds(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return [
      ...new Set(
        value.filter(
          (item): item is string => typeof item === 'string' && item.startsWith(IdPrefix.Attachment)
        )
      ),
    ];
  }

  private toAttachmentApplyValue(
    value: unknown,
    keepAttachmentIds: unknown
  ): IAttachmentApplyValue {
    return {
      urls: this.normalizeAttachmentValue(value) ?? [],
      keepAttachmentIds: this.normalizeAttachmentKeepIds(keepAttachmentIds),
    };
  }

  private async getExistingAttachmentPreview(
    tableId: string,
    recordId: string,
    fields: IExtractField[]
  ): Promise<Map<string, { id: string; name: string; url: string }[]>> {
    const attachmentFields = fields.filter((field) => field.type === FieldType.Attachment);
    if (!attachmentFields.length) {
      return new Map();
    }

    const record = await this.recordService.getRecord(
      tableId,
      recordId,
      {
        projection: attachmentFields.map((field) => field.id),
        fieldKeyType: FieldKeyType.Id,
      },
      true,
      true
    );

    return new Map(
      attachmentFields.map((field) => {
        const attachments = Array.isArray(record.fields[field.id])
          ? (record.fields[field.id] as IAttachmentItem[])
          : [];
        return [
          field.id,
          attachments
            .map((attachment) => ({
              id: attachment.id,
              name: attachment.name,
              url:
                attachment.presignedUrl ??
                attachment.lgThumbnailUrl ??
                attachment.smThumbnailUrl ??
                attachment.path,
            }))
            .filter((attachment) => Boolean(attachment.url)),
        ];
      })
    );
  }

  private formatReadonlyPromptValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    return JSON.stringify(value);
  }

  private async getAutoNumberReadonlyContext(
    tableId: string,
    recordId: string
  ): Promise<string | undefined> {
    const autoNumberFields = await this.prismaService.field.findMany({
      where: {
        tableId,
        deletedTime: null,
        type: FieldType.AutoNumber,
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
      },
    });

    if (!autoNumberFields.length) {
      return undefined;
    }

    const record = await this.recordService.getRecord(
      tableId,
      recordId,
      {
        projection: autoNumberFields.map((field) => field.id),
        fieldKeyType: FieldKeyType.Id,
      },
      true,
      true
    );

    const lines = autoNumberFields
      .map((field) => {
        const value = record.fields[field.id];
        if (value == null) {
          return null;
        }

        return `- ${field.id} | ${field.name} | ${field.type} | ${this.formatReadonlyPromptValue(value)}`;
      })
      .filter((line): line is string => Boolean(line));

    return lines.length ? lines.join('\n') : undefined;
  }

  private normalizeDateValue(value: unknown): string | null {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString();
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  private normalizeRatingValue(value: unknown, field: IExtractField): number | null {
    const numericValue = this.normalizeNumericValue(value);
    if (numericValue == null) {
      return null;
    }

    const normalized = Math.round(numericValue);
    const options = this.parseJsonString<{ max?: number }>(field.options);
    const max = options?.max ?? 5;

    if (normalized < 1 || normalized > max) {
      return null;
    }

    return normalized;
  }

  private normalizeFieldPreview(
    field: IExtractField,
    rawValue: unknown,
    includeUnsupported = true
  ): IAiExtractWritePreviewField {
    const choices = this.getFieldChoices(field);

    if (!AI_EXTRACT_SUPPORTED_FIELD_TYPES.has(field.type)) {
      return {
        fieldId: field.id,
        name: field.name,
        type: field.type,
        status: includeUnsupported ? 'unsupported' : 'empty',
        reason: includeUnsupported ? `Field type ${field.type} is not supported yet.` : undefined,
        choices,
      };
    }

    if (rawValue == null || (typeof rawValue === 'string' && !rawValue.trim())) {
      return {
        fieldId: field.id,
        name: field.name,
        type: field.type,
        status: 'empty',
        value: null,
        choices,
      };
    }

    let value: unknown;
    switch (field.type as IExtractSupportedFieldType) {
      case FieldType.SingleLineText:
        value = this.normalizeStructuredTextValue(rawValue, this.getTextShowAsType(field));
        break;
      case FieldType.LongText:
        value = this.normalizeStructuredTextValue(rawValue, null);
        break;
      case FieldType.Date:
        value = this.normalizeDateValue(rawValue);
        break;
      case FieldType.Number:
        value = this.normalizeNumericValue(rawValue);
        break;
      case FieldType.Rating:
        value = this.normalizeRatingValue(rawValue, field);
        break;
      case FieldType.Checkbox:
        value = this.normalizeCheckboxValue(rawValue);
        break;
      case FieldType.Attachment:
        value = this.normalizeAttachmentValue(rawValue);
        break;
      case FieldType.SingleSelect:
        value = choices ? this.normalizeChoiceValue(rawValue, choices) : null;
        break;
      case FieldType.MultipleSelect:
        value = choices ? this.normalizeMultipleChoiceValue(rawValue, choices) : null;
        break;
      default:
        value = null;
    }

    if (value == null || (Array.isArray(value) && value.length === 0)) {
      return {
        fieldId: field.id,
        name: field.name,
        type: field.type,
        status: 'invalid',
        value: null,
        reason: 'AI returned a value that does not match the field type.',
        choices,
      };
    }

    return {
      fieldId: field.id,
      name: field.name,
      type: field.type,
      status: 'filled',
      value,
      choices,
    };
  }

  private async getExtractFields(baseId: string, tableId: string, fieldIds?: string[]) {
    await this.assertTableInBase(baseId, tableId);
    const fields = await this.prismaService.field.findMany({
      where: {
        tableId,
        deletedTime: null,
        ...(fieldIds?.length ? { id: { in: fieldIds } } : {}),
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        options: true,
        isComputed: true,
      },
    });

    const editableFields = fields.filter((field) => !field.isComputed).map((field) => field);
    if (fieldIds?.length) {
      const orderedFields = fieldIds
        .map((fieldId) => editableFields.find((field) => field.id === fieldId))
        .filter((field): field is (typeof editableFields)[number] => Boolean(field));
      return orderedFields;
    }

    return editableFields.filter((field) =>
      AI_EXTRACT_SUPPORTED_FIELD_TYPES.has(field.type as FieldType)
    );
  }

  async previewExtractAndWrite(
    baseId: string,
    body: IAiExtractWritePreviewRo
  ): Promise<IAiExtractWritePreviewVo> {
    const fields = await this.getExtractFields(baseId, body.tableId, body.fieldIds);
    const readonlyContext = body.recordId
      ? await this.getAutoNumberReadonlyContext(body.tableId, body.recordId)
      : undefined;
    const warnings: string[] = [];

    if (body.recordId) {
      await this.permissionService.validPermissions(body.tableId, ['record|update']);
    } else {
      await this.permissionService.validPermissions(body.tableId, ['record|create']);
    }

    if (!fields.length) {
      warnings.push('No writable target fields are available for AI extraction.');
      return {
        action: body.recordId ? 'update' : 'create',
        tableId: body.tableId,
        recordId: body.recordId,
        fields: [],
        warnings,
      };
    }

    const modelInstance = await this.getGenerationModelInstance(baseId, {
      prompt: body.sourceText,
      task: Task.Coding,
      modelKey: body.modelKey,
    });

    const { text } = await generateText({
      model: modelInstance,
      prompt: this.buildExtractPrompt(
        fields.map((field) => ({
          ...field,
          type: field.type as FieldType,
          choices: this.getFieldChoices(field as IExtractField),
        })),
        body,
        readonlyContext
      ),
    });

    const rawResult = this.parseAiJson(text);
    const existingAttachmentPreview = body.recordId
      ? await this.getExistingAttachmentPreview(
          body.tableId,
          body.recordId,
          fields as IExtractField[]
        )
      : new Map<string, { id: string; name: string; url: string }[]>();
    const previewFields = fields.map((field) => {
      const normalizedField = this.normalizeFieldPreview(
        field as IExtractField,
        rawResult[field.id]
      );
      if (field.type !== FieldType.Attachment || !body.recordId) {
        return normalizedField;
      }

      return {
        ...normalizedField,
        existingAttachments: existingAttachmentPreview.get(field.id) ?? [],
        keepExistingAttachmentIds: [],
      };
    });

    if (!previewFields.some((field) => field.status === 'filled')) {
      warnings.push('AI did not return any valid writable values for the selected fields.');
    }

    return {
      action: body.recordId ? 'update' : 'create',
      tableId: body.tableId,
      recordId: body.recordId,
      fields: previewFields,
      warnings,
    };
  }

  async applyExtractAndWrite(
    baseId: string,
    body: IAiExtractWriteApplyRo
  ): Promise<IAiExtractWriteApplyVo> {
    const fields = await this.getExtractFields(
      baseId,
      body.tableId,
      body.fields.map((field) => field.fieldId)
    );
    const fieldMap = new Map(fields.map((field) => [field.id, field as IExtractField]));
    const appliedFields = body.fields
      .map((field) => {
        const targetField = fieldMap.get(field.fieldId);
        if (!targetField) {
          return null;
        }

        if (targetField.type === FieldType.Attachment) {
          const attachmentValue = this.toAttachmentApplyValue(
            field.value,
            field.keepExistingAttachmentIds
          );
          if (body.recordId) {
            return {
              fieldId: targetField.id,
              name: targetField.name,
              value: attachmentValue,
            };
          }

          if (!attachmentValue.urls.length) {
            return null;
          }

          return {
            fieldId: targetField.id,
            name: targetField.name,
            value: attachmentValue,
          };
        }

        const normalized = this.normalizeFieldPreview(targetField, field.value, false);
        return normalized.status === 'filled'
          ? {
              fieldId: targetField.id,
              name: targetField.name,
              value: normalized.value,
            }
          : null;
      })
      .filter(
        (
          field
        ): field is {
          fieldId: string;
          name: string;
          value: unknown;
        } => Boolean(field)
      );

    const attachmentFields = appliedFields.filter(
      (field) => fieldMap.get(field.fieldId)?.type === FieldType.Attachment
    );
    const regularFields = appliedFields.filter(
      (field) => fieldMap.get(field.fieldId)?.type !== FieldType.Attachment
    );

    if (!appliedFields.length) {
      throw new CustomHttpException('No valid fields to apply', HttpErrorCode.VALIDATION_ERROR);
    }

    let operation: IAiRecordOperationVo;
    let targetRecordId = body.recordId;
    if (body.recordId) {
      await this.permissionService.validPermissions(body.tableId, ['record|update']);
      const currentAttachmentRecord = attachmentFields.length
        ? await this.recordService.getRecord(
            body.tableId,
            body.recordId,
            {
              projection: attachmentFields.map((field) => field.fieldId),
              fieldKeyType: FieldKeyType.Id,
            },
            true,
            true
          )
        : null;
      const attachmentResetFields = Object.fromEntries(
        attachmentFields.map((field) => {
          const { keepAttachmentIds } = field.value as IAttachmentApplyValue;
          const currentAttachments = Array.isArray(currentAttachmentRecord?.fields[field.fieldId])
            ? (currentAttachmentRecord?.fields[field.fieldId] as IAttachmentItem[])
            : [];
          const retainedAttachments = keepAttachmentIds.length
            ? currentAttachments.filter((attachment) => keepAttachmentIds.includes(attachment.id))
            : [];
          return [field.name, retainedAttachments];
        })
      );
      const updateFields = {
        ...Object.fromEntries(regularFields.map((field) => [field.name, field.value])),
        ...attachmentResetFields,
      };

      if (Object.keys(updateFields).length) {
        operation = await this.recordOperation(baseId, {
          action: 'update',
          tableId: body.tableId,
          payload: {
            fieldKeyType: FieldKeyType.Name,
            records: [
              {
                id: body.recordId,
                fields: updateFields,
              },
            ],
            aiContext: {},
          },
        });
      } else {
        operation = {
          action: 'update',
          tableId: body.tableId,
          records: [],
        };
      }
    } else {
      await this.permissionService.validPermissions(body.tableId, ['record|create']);
      operation = await this.recordOperation(baseId, {
        action: 'create',
        tableId: body.tableId,
        payload: {
          fieldKeyType: FieldKeyType.Name,
          records: [
            {
              fields: Object.fromEntries(regularFields.map((field) => [field.name, field.value])),
            },
          ],
        },
      });
      targetRecordId = operation.action === 'create' ? operation.records[0]?.id : undefined;
    }

    if (!targetRecordId) {
      throw new CustomHttpException(
        'Target record is required for attachment upload',
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    for (const attachmentField of attachmentFields) {
      const { urls } = attachmentField.value as IAttachmentApplyValue;
      for (const url of urls) {
        const record = await this.recordOpenApiService.uploadAttachment(
          body.tableId,
          targetRecordId,
          attachmentField.fieldId,
          undefined,
          url
        );

        operation = body.recordId
          ? {
              action: 'update',
              tableId: body.tableId,
              records: [record],
            }
          : {
              action: 'create',
              tableId: body.tableId,
              records: [record],
            };
      }
    }

    return {
      operation,
      appliedFieldIds: appliedFields.map((field) => field.fieldId),
    };
  }

  async getViewContext(baseId: string, query: IAiViewContextQuery): Promise<IAiViewContextVo> {
    const { tableId, viewId, ignoreViewQuery, filter, orderBy, groupBy, search } = query;
    const sampleSize = query.sampleSize ?? 5;
    const normalizedSearch = this.normalizeSearchQuery(search);

    await this.prismaService.tableMeta.findFirstOrThrow({
      where: {
        id: tableId,
        baseId,
        deletedTime: null,
      },
      select: { id: true },
    });

    const viewRaw = viewId
      ? await this.prismaService.view.findFirstOrThrow({
          where: {
            id: viewId,
            tableId,
            deletedTime: null,
          },
          select: {
            id: true,
            name: true,
            type: true,
            filter: true,
            sort: true,
            group: true,
            columnMeta: true,
          },
        })
      : null;

    const columnMeta = viewRaw?.columnMeta
      ? (JSON.parse(viewRaw.columnMeta) as IColumnMeta)
      : undefined;
    const fieldRaws = await this.prismaService.field.findMany({
      where: {
        tableId,
        deletedTime: null,
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        type: true,
        isPrimary: true,
      },
    });

    const fields: IAiViewContextField[] = fieldRaws.map((field) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      isPrimary: Boolean(field.isPrimary),
      visible: isFieldVisible(columnMeta, field.id),
    }));

    const visibleFieldIds = fields.filter((field) => field.visible).map((field) => field.id);
    const sampleFieldIds = (
      visibleFieldIds.length ? visibleFieldIds : fields.map((field) => field.id)
    ).slice(0, 8);

    const effectiveQuery = await this.recordService.prepareQuery(tableId, {
      viewId,
      ignoreViewQuery,
      filter,
      orderBy,
      groupBy,
      search: normalizedSearch,
    });

    const effectiveGroupBy = (groupBy ??
      (viewRaw?.group ? (JSON.parse(viewRaw.group) as IGroup) : undefined)) as IGroup | undefined;

    const totalRecords = await this.recordService.getRecords(tableId, {
      viewId,
      ignoreViewQuery,
      filter,
      orderBy,
      groupBy: effectiveGroupBy,
      search: normalizedSearch,
      take: 1,
    });

    const sampleRecords = await this.recordService.getRecords(
      tableId,
      {
        viewId,
        ignoreViewQuery,
        filter,
        orderBy,
        groupBy: effectiveGroupBy,
        search: normalizedSearch,
        take: sampleSize,
        fieldKeyType: FieldKeyType.Id,
        projection: sampleFieldIds,
      },
      true
    );

    return {
      tableId,
      viewId,
      summary: {
        totalCount: totalRecords.records.length,
        sampleSize,
        appliedViewQuery: Boolean(viewId) && !ignoreViewQuery,
      },
      view: viewRaw
        ? {
            id: viewRaw.id,
            name: viewRaw.name,
            type: viewRaw.type,
            filter: viewRaw.filter ? (JSON.parse(viewRaw.filter) as IFilter) : undefined,
            sort: viewRaw.sort ? (JSON.parse(viewRaw.sort) as ISortItem[]) : undefined,
            group: viewRaw.group ? (JSON.parse(viewRaw.group) as IGroup) : undefined,
            columnMeta,
          }
        : undefined,
      effectiveQuery: {
        filter: effectiveQuery.filter,
        orderBy: effectiveQuery.orderBy,
        groupBy: effectiveGroupBy,
        search: normalizedSearch,
      },
      fields,
      sampleRecords: sampleRecords.records,
    };
  }

  private normalizeSearchQuery(search?: string[]) {
    if (!search?.length) {
      return undefined;
    }

    return search.slice(0, 3) as [string] | [string, string] | [string, string, boolean];
  }

  public parseModelKey(modelKey: string) {
    const [type, model, name] = modelKey.split('@');
    return { type, model, name };
  }

  /**
   * Check if modelKey is an AI Gateway model
   * Format: aiGateway@<modelId>@teable
   */
  public isGatewayModel(modelKey: string): boolean {
    const { type } = this.parseModelKey(modelKey);
    return type?.toLowerCase() === LLMProviderType.AI_GATEWAY.toLowerCase();
  }

  /**
   * Build a gateway modelKey from a gateway model ID
   * @param modelId Gateway model ID (e.g., "anthropic/claude-sonnet-4")
   */
  public buildGatewayModelKey(modelId: string): string {
    return `${LLMProviderType.AI_GATEWAY}@${modelId}@${INSTANCE_PROVIDER_NAME}`;
  }

  /**
   * Parse owner/provider from gateway model ID
   * @param modelId Gateway model ID (e.g., "anthropic/claude-sonnet-4" -> "anthropic")
   */
  private parseOwnerFromModelId(modelId: string): string | undefined {
    const parts = modelId.split('/');
    return parts.length > 1 ? parts[0].toLowerCase() : undefined;
  }

  // modelKey-> type@model@name
  async getModelConfig(modelKey: string, llmProviders: LLMProvider[] = []) {
    const { type, model, name } = this.parseModelKey(modelKey);

    // Special handling for AI Gateway models
    if (this.isGatewayModel(modelKey)) {
      const { aiConfig } = await this.settingService.getSetting([SettingKey.AI_CONFIG]);

      if (!aiConfig?.aiGatewayApiKey) {
        throw new CustomHttpException(
          'AI Gateway API key is not configured',
          HttpErrorCode.VALIDATION_ERROR,
          {
            localization: {
              i18nKey: 'httpErrors.ai.gatewayApiKeyNotSet',
            },
          }
        );
      }

      return {
        type: LLMProviderType.AI_GATEWAY,
        model, // This is the gateway modelId (e.g., "anthropic/claude-sonnet-4")
        baseUrl: aiConfig.aiGatewayBaseUrl || undefined,
        apiKey: aiConfig.aiGatewayApiKey,
      };
    }

    // Standard provider lookup
    const providerConfig = llmProviders.find(
      (p) =>
        p.name.toLowerCase() === name.toLowerCase() && p.type.toLowerCase() === type.toLowerCase()
    );

    if (!providerConfig) {
      throw new CustomHttpException(
        'AI provider configuration is not set',
        HttpErrorCode.VALIDATION_ERROR,
        {
          localization: {
            i18nKey: 'httpErrors.ai.providerConfigurationNotSet',
          },
        }
      );
    }

    const { baseUrl, apiKey } = providerConfig;

    return {
      type,
      model,
      baseUrl,
      apiKey,
    };
  }

  async getModelInstance(
    modelKey: string,
    llmProviders: LLMProvider[],
    isImageGeneration: true
  ): Promise<ReturnType<OpenAIProvider['image']>>;
  async getModelInstance(
    modelKey: string,
    llmProviders?: LLMProvider[],
    isImageGeneration?: false
  ): Promise<ILanguageModelV2>;
  async getModelInstance(
    modelKey: string,
    llmProviders: LLMProvider[] = [],
    isImageGeneration = false
  ): Promise<ILanguageModelV2 | ImageModel> {
    const { type, model, baseUrl, apiKey } = await this.getModelConfig(modelKey, llmProviders);

    // For AI Gateway models, use official gateway provider from AI SDK
    // See: https://ai-sdk.dev/providers/ai-sdk-providers/ai-gateway
    // baseUrl is optional - SDK uses its default if not provided
    if (type === LLMProviderType.AI_GATEWAY) {
      if (!apiKey) {
        throw new CustomHttpException(
          'AI configuration is not set',
          HttpErrorCode.VALIDATION_ERROR,
          {
            localization: {
              i18nKey: 'httpErrors.ai.configurationNotSet',
            },
          }
        );
      }
      const gatewayProvider = createGateway({
        apiKey,
        ...(baseUrl && { baseURL: baseUrl }),
      });
      // Return appropriate model type based on isImageGeneration flag
      // Image models (e.g., bfl/flux-pro) use gatewayProvider.imageModel()
      // Language models (including Gemini image via generateText) use gatewayProvider()
      return isImageGeneration ? gatewayProvider.imageModel(model) : gatewayProvider(model);
    }

    // For standard providers, both baseUrl and apiKey are required
    if (!baseUrl || !apiKey) {
      throw new CustomHttpException('AI configuration is not set', HttpErrorCode.VALIDATION_ERROR, {
        localization: {
          i18nKey: 'httpErrors.ai.configurationNotSet',
        },
      });
    }

    const effectiveType = type;
    const effectiveModel = model;

    const provider = Object.entries(modelProviders).find(
      ([key]) => effectiveType.toLowerCase() === key.toLowerCase()
    )?.[1];

    if (!provider) {
      throw new CustomHttpException(
        `Unsupported AI provider: ${effectiveType}`,
        HttpErrorCode.VALIDATION_ERROR,
        {
          localization: {
            i18nKey: 'httpErrors.ai.unsupportedProvider',
            context: {
              type: effectiveType,
            },
          },
        }
      );
    }

    const providerOptions = getAdaptedProviderOptions(effectiveType as LLMProviderType, {
      name: effectiveModel,
      baseURL: baseUrl,
      apiKey,
    });
    const modelProvider = provider(providerOptions as never) as OpenAIProvider;

    return isImageGeneration
      ? (modelProvider.image(effectiveModel) as ReturnType<OpenAIProvider['image']>)
      : modelProvider(effectiveModel);
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  async getAIConfig(baseId: string) {
    const { spaceId } = await this.prismaService.base.findUniqueOrThrow({
      where: { id: baseId },
    });
    const aiIntegration = await this.prismaService.integration.findFirst({
      where: { resourceId: spaceId, type: IntegrationType.AI, enable: true },
    });

    const aiIntegrationConfig = aiIntegration?.config ? JSON.parse(aiIntegration.config) : null;
    const { aiConfig } = await this.settingService.getSetting();

    const hasInstanceAIConfig =
      aiConfig &&
      (aiConfig.enable ||
        aiConfig.chatModel?.lg ||
        aiConfig.llmProviders?.length > 0 ||
        aiConfig.aiGatewayApiKey);
    if (!aiIntegrationConfig && !hasInstanceAIConfig) {
      throw new CustomHttpException('AI configuration is not set', HttpErrorCode.VALIDATION_ERROR, {
        localization: {
          i18nKey: 'httpErrors.ai.configurationNotSet',
        },
      });
    }

    let config: IAIConfig;

    if (!aiIntegrationConfig) {
      const lg = aiConfig?.chatModel?.lg;
      const sm = aiConfig?.chatModel?.sm;
      const md = aiConfig?.chatModel?.md;
      const ability = aiConfig?.chatModel?.ability;

      config = {
        ...aiConfig,
        llmProviders: aiConfig?.llmProviders.map((provider) => ({
          ...provider,
          isInstance: true,
        })),
        chatModel: {
          sm: sm || lg,
          md: md || lg,
          lg: lg,
          ability,
        },
      } as IAIConfig;
    } else if (!aiConfig?.chatModel?.lg) {
      config = aiIntegrationConfig as IAIConfig;
    } else {
      const lg = aiConfig.chatModel.lg;
      const sm = aiConfig.chatModel.sm;
      const md = aiConfig.chatModel.md;
      const ability = aiConfig.chatModel.ability;
      config = {
        ...aiIntegrationConfig,
        // Include gateway models from admin config (space config doesn't have gateway models)
        gatewayModels: aiConfig.gatewayModels,
        llmProviders: [
          ...aiIntegrationConfig.llmProviders,
          ...aiConfig.llmProviders.map((provider) => ({
            ...provider,
            isInstance: true,
          })),
        ],
        chatModel: {
          sm: sm || lg,
          md: md || lg,
          lg: lg,
          ability,
        },
      } as IAIConfig;
    }

    // Fetch tags for the lg chat model and include in response
    const lgModelKey = config.chatModel?.lg;
    if (lgModelKey) {
      try {
        const tags = await this.getModelTags(lgModelKey, config.llmProviders);
        if (tags.length > 0) {
          // Add tags to chatModel response (IGetAIConfig extends IAIConfig with tags)
          return {
            ...config,
            chatModel: {
              ...config.chatModel,
              tags,
            },
          } as IGetAIConfig;
        }
      } catch (error) {
        this.logger.warn(`[getAIConfig] Failed to get tags for chat model ${lgModelKey}: ${error}`);
      }
    }

    return config as IGetAIConfig;
  }

  async getAIDisableAIActions(baseId: string) {
    const { spaceId } = await this.prismaService.base.findUniqueOrThrow({
      where: { id: baseId },
      select: { spaceId: true },
    });
    // get space ai setting
    const aiIntegration = await this.prismaService.integration.findUnique({
      where: { resourceId: spaceId, type: IntegrationType.AI },
    });

    const aiIntegrationConfig = aiIntegration?.config ? JSON.parse(aiIntegration.config) : null;
    const disableAIActionsFromSpaceIntegration =
      aiIntegrationConfig?.capabilities?.disableActions ?? [];

    // get instance ai setting
    const { aiConfig } = await this.settingService.getSetting();
    const disableAIActionsFromInstanceAiSetting = aiConfig?.capabilities?.disableActions ?? [];

    // merge both: instance-level disableActions should always be respected
    const merged = [
      ...disableAIActionsFromInstanceAiSetting,
      ...disableAIActionsFromSpaceIntegration,
    ];
    return {
      disableActions: [...new Set(merged)],
    };
  }

  async getSimplifiedAIConfig(baseId: string) {
    try {
      const config = await this.getAIConfig(baseId);
      return {
        ...config,
        llmProviders: config.llmProviders.map(
          ({ type, name, models, isInstance, modelConfigs }) => ({
            type,
            name,
            models,
            isInstance,
            modelConfigs,
          })
        ),
      };
    } catch {
      return null;
    }
  }

  async getNativeCapabilities(baseId: string, query?: IGetNativeAICapabilitiesQuery) {
    const [config, disableActionVo] = await Promise.all([
      this.getSimplifiedAIConfig(baseId),
      this.getAIDisableAIActions(baseId),
    ]);
    const items = filterNativeCapabilities(
      resolveNativeCapabilities(config, disableActionVo.disableActions),
      query
    );
    return buildNativeCapabilitiesVo(items);
  }

  async queryNativeCapabilities(baseId: string, queryRo: IQueryNativeAICapabilitiesRo) {
    const [config, disableActionVo] = await Promise.all([
      this.getSimplifiedAIConfig(baseId),
      this.getAIDisableAIActions(baseId),
    ]);
    const items = resolveNativeCapabilities(config, disableActionVo.disableActions);
    return queryNativeCapabilities(items, queryRo);
  }

  private async getGenerationModelInstance(baseId: string, aiGenerateRo: IAiGenerateRo) {
    const { modelKey: _modelKey, task = Task.Coding } = aiGenerateRo;
    const config = await this.getAIConfig(baseId);
    const modelKey = _modelKey ?? getTaskModelKey(config, task);
    if (!modelKey) {
      throw new Error('Model key is not set');
    }
    return await this.getModelInstance(modelKey, config.llmProviders);
  }

  async generateStream(
    baseId: string,
    aiGenerateRo: IAiGenerateRo,
    response: Response
  ): Promise<void> {
    const { prompt } = aiGenerateRo;
    const modelInstance = await this.getGenerationModelInstance(baseId, aiGenerateRo);

    const result = streamText({
      model: modelInstance,
      prompt: prompt,
    });

    response.status(200);
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');

    try {
      for await (const chunk of result.textStream) {
        response.write(chunk);
      }

      response.end();
    } catch (error) {
      const message = getAiStreamErrorMessage(error, 'Upstream response stream was aborted');
      handleAiStreamErrorResponse(
        response,
        createAiStreamError(AiStreamErrorCode.StreamReadError, message),
        (streamError) => {
          response.write(`\n[stream_error] ${streamError.message}`);
          response.end();
        }
      );
    }
  }

  async generateText(baseId: string, aiGenerateRo: IAiGenerateRo) {
    const { prompt } = aiGenerateRo;
    const modelInstance = await this.getGenerationModelInstance(baseId, aiGenerateRo);

    const { text } = await generateText({
      model: modelInstance,
      prompt: prompt,
    });
    return text;
  }

  async getInstanceAIConfig() {
    if (!this.baseConfig.isCloud) return null;

    const { aiConfig } = await this.settingService.getSetting();

    if (!aiConfig?.chatModel?.lg) return null;

    return aiConfig;
  }

  findModelInProviders(modelKey: string, llmProviders: LLMProvider[]): boolean {
    const { type, model, name } = this.parseModelKey(modelKey);

    const providerConfig = llmProviders.find(
      (p) =>
        p.name.toLowerCase() === name.toLowerCase() &&
        p.type.toLowerCase() === type.toLowerCase() &&
        p.models.includes(model)
    );
    return !!providerConfig;
  }

  /**
   * Check if a model is an instance (platform-provided) model.
   * Instance models use the "@teable" provider name suffix (e.g. "aiGateway@model@teable").
   * BYOK (user-configured) models have a custom provider name.
   */
  checkInstanceAIModel(modelKey: string): boolean {
    return modelKey.endsWith(`@${INSTANCE_PROVIDER_NAME}`);
  }

  async getChatModelInstance(baseId: string) {
    const { chatModel, llmProviders } = await this.getAIConfig(baseId);
    if (!chatModel?.lg) {
      throw new CustomHttpException('AI chat model lg is not set', HttpErrorCode.VALIDATION_ERROR, {
        localization: {
          i18nKey: 'httpErrors.ai.chatModelLgNotSet',
        },
      });
    }

    // Check if lg model is a gateway model
    const isGateway = this.isGatewayModel(chatModel.lg);
    let isInstance = false;

    if (isGateway) {
      // Gateway models are instance-level (from admin config)
      isInstance = true;
    } else {
      // Standard provider lookup
      const { type, model, name } = this.parseModelKey(chatModel?.lg);
      const lgProvider = llmProviders.find(
        (p) =>
          p.name.toLowerCase() === name.toLowerCase() &&
          p.type.toLowerCase() === type.toLowerCase() &&
          p.models.includes(model)
      );
      if (!lgProvider) {
        throw new CustomHttpException(
          'AI chat model lg provider is not set',
          HttpErrorCode.VALIDATION_ERROR,
          {
            localization: {
              i18nKey: 'httpErrors.ai.chatModelLgProviderNotSet',
            },
          }
        );
      }
      isInstance = !!lgProvider.isInstance;
    }

    if (!chatModel?.sm) {
      throw new CustomHttpException('AI chat model sm is not set', HttpErrorCode.VALIDATION_ERROR, {
        localization: {
          i18nKey: 'httpErrors.ai.chatModelSmNotSet',
        },
      });
    }
    if (!chatModel?.md) {
      throw new CustomHttpException('AI chat model md is not set', HttpErrorCode.VALIDATION_ERROR, {
        localization: {
          i18nKey: 'httpErrors.ai.chatModelMdNotSet',
        },
      });
    }

    return {
      sm: await this.getModelInstance(chatModel?.sm, llmProviders),
      md: await this.getModelInstance(chatModel?.md, llmProviders),
      lg: await this.getModelInstance(chatModel?.lg, llmProviders),
      ability: chatModel?.ability,
      isInstance,
      lgModelKey: chatModel.lg,
      mdModelKey: chatModel.md,
      smModelKey: chatModel.sm,
    };
  }

  /**
   * Get gateway model configuration by modelId
   * First checks local gatewayModels config, then falls back to API
   */
  async getGatewayModelConfig(modelId: string) {
    // First check local config (admin-configured models)
    const { aiConfig } = await this.settingService.getSetting([SettingKey.AI_CONFIG]);
    const gatewayModels = aiConfig?.gatewayModels ?? [];
    const localModel = gatewayModels.find((m) => m.id === modelId);
    if (localModel) {
      return localModel;
    }

    // If not found locally, fetch from API (for custom-selected models)
    const apiModel = await this.getGatewayApiModel(modelId);
    if (apiModel) {
      // Convert API model format to local model format
      return {
        ...apiModel,
        label: apiModel.name || apiModel.id,
        enabled: true,
      };
    }

    return undefined;
  }

  /**
   * Get model capability tags for any model (AI Gateway or custom provider)
   * This is the unified method to determine model capabilities like vision, file-input, etc.
   *
   * Priority:
   * 1. AI Gateway: from getGatewayModelConfig().tags
   * 2. Custom Provider: from modelConfigs[model].tags
   * 3. Fallback: convert deprecated ability field to tags (backward compatibility)
   *
   * @param modelKey - Model key in format: type@model@name
   * @param llmProviders - List of configured LLM providers (required for custom providers)
   */
  async getModelTags(modelKey: string, llmProviders: LLMProvider[]): Promise<GatewayModelTag[]> {
    const { type, model, name } = this.parseModelKey(modelKey);

    // AI Gateway models: get tags from gateway config
    if (type === LLMProviderType.AI_GATEWAY) {
      try {
        const gatewayModel = await this.getGatewayModelConfig(model);
        if (gatewayModel?.tags?.length) {
          const tags = [...gatewayModel.tags];
          // Patch: Google models with image-generation capability also support vision (image-to-image)
          // This is because Gemini image models can accept images as input for image generation
          if (
            model.startsWith('google/') &&
            tags.includes('image-generation') &&
            !tags.includes('vision')
          ) {
            tags.push('vision');
          }
          return tags;
        }
      } catch (error) {
        this.logger.warn(`[getModelTags] Failed to get gateway config for ${model}: ${error}`);
      }
      return [];
    }

    // Custom providers: get tags from modelConfigs
    const provider = llmProviders.find((p) => p.type === type && p.name === name);
    const modelConfig = provider?.modelConfigs?.[model];

    // Priority 1: Use tags if available
    if (modelConfig?.tags?.length) {
      return modelConfig.tags;
    }

    // Priority 2: Fallback to converting deprecated ability to tags
    if (modelConfig?.ability) {
      return this.abilityToTags(modelConfig.ability);
    }

    return [];
  }

  /**
   * Convert deprecated IChatModelAbility to GatewayModelTag[]
   * Used for backward compatibility with old ability format
   */
  private abilityToTags(ability: IChatModelAbility): GatewayModelTag[] {
    const tags: GatewayModelTag[] = [];
    if (ability.image) tags.push('vision');
    if (ability.pdf) tags.push('file-input');
    if (ability.toolCall) tags.push('tool-use');
    if (ability.reasoning) tags.push('reasoning');
    if (ability.imageGeneration) tags.push('image-generation');
    return tags;
  }

  /**
   * Get gateway model pricing for billing calculation
   * First checks local gatewayModels config, then falls back to API
   */
  async getGatewayModelPricing(modelId: string) {
    // First check local config (admin-configured models)
    const { aiConfig } = await this.settingService.getSetting([SettingKey.AI_CONFIG]);
    const gatewayModels = aiConfig?.gatewayModels ?? [];
    const localModel = gatewayModels.find((m) => m.id === modelId);
    if (localModel?.pricing) {
      // Normalize handles both camelCase (admin UI) and snake_case (legacy stored data)
      const pricing = normalizeGatewayPricing(localModel.pricing);
      this.logger.debug(
        `[getGatewayModelPricing] Found local pricing for ${modelId}: ${JSON.stringify(pricing)}`
      );
      return pricing;
    }

    // If not found locally, fetch from API (already normalized by convertGatewayApiModel)
    try {
      const apiModel = await this.getGatewayApiModel(modelId);
      if (apiModel?.pricing) {
        this.logger.debug(
          `[getGatewayModelPricing] Found API pricing for ${modelId}: ${JSON.stringify(apiModel.pricing)}`
        );
        return apiModel.pricing;
      }
    } catch (error) {
      this.logger.warn(`[getGatewayModelPricing] Failed to fetch API pricing for ${modelId}`);
    }

    this.logger.debug(
      `[getGatewayModelPricing] No pricing found for ${modelId}, will use default rates`
    );
    return undefined;
  }

  /**
   * Get a specific model from Gateway API
   * Uses Redis cached data if available
   */
  private async getGatewayApiModel(modelId: string): Promise<IGatewayApiModel | undefined> {
    const models = await this.fetchGatewayModelsFromApi();
    const normalize = (s: string) =>
      s.split('/').pop()!.replaceAll('.', '').replaceAll('-', '').toLowerCase();
    const stripDateSuffix = (s: string) => s.replace(/\d{8,}$/, '');
    return models.find((m) => {
      const a = normalize(modelId);
      const b = normalize(m.id);
      if (a === b) return true;
      return stripDateSuffix(a) === stripDateSuffix(b);
    });
  }

  /**
   * Fetch all models from AI Gateway API with in-memory caching
   * This method is also used by setting-open-api.service.ts
   * Cache TTL: 10 minutes (static data, doesn't change frequently)
   */
  async fetchGatewayModelsFromApi(): Promise<IGatewayApiModel[]> {
    // Check in-memory cache first
    if (this.gatewayModelsCache && Date.now() < this.gatewayModelsCache.expiresAt) {
      return this.gatewayModelsCache.data;
    }

    try {
      const response = await axios.get<{ data: IGatewayApiModelRaw[] }>(
        'https://ai-gateway.vercel.sh/v1/models',
        { timeout: 10000 }
      );

      // Convert snake_case API response to camelCase
      const models = (response.data?.data || []).map(convertGatewayApiModel);

      // Update in-memory cache
      this.gatewayModelsCache = {
        data: models,
        expiresAt: Date.now() + gatewayModelsCacheTtl,
      };

      return models;
    } catch (error) {
      // If fetch fails but we have stale cache, return it
      if (this.gatewayModelsCache) {
        this.logger.warn(
          `[fetchGatewayModelsFromApi] Failed to refresh, using stale cache: ${error}`
        );
        return this.gatewayModelsCache.data;
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch AI Gateway models: ${errorMessage}`);
    }
  }

  /**
   * Get attachment transfer mode from aiConfig
   * @returns 'url' (default) or 'base64'
   */
  async getAttachmentTransferMode(): Promise<'url' | 'base64'> {
    const { aiConfig } = await this.settingService.getSetting([SettingKey.AI_CONFIG]);
    return aiConfig?.attachmentTransferMode || 'url';
  }

  /**
   * Find the first model that supports vision capability from configured models.
   * Searches in order: gateway models (enabled), then custom llm providers.
   * Returns complete model info to avoid redundant lookups.
   *
   * @param llmProviders - List of configured LLM providers
   * @returns Complete vision model info, or undefined if none found
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  async findFirstVisionModel(llmProviders: LLMProvider[]): Promise<
    | {
        modelKey: string;
        modelInstance: ILanguageModelV2;
        isInstance: boolean;
        tags: GatewayModelTag[];
      }
    | undefined
  > {
    const { aiConfig } = await this.settingService.getSetting([SettingKey.AI_CONFIG]);

    // 1. Check gateway models first (they are typically more capable)
    const gatewayModels = aiConfig?.gatewayModels ?? [];
    for (const model of gatewayModels) {
      if (!model.enabled) continue;

      if (model.tags?.includes('vision')) {
        const modelKey = this.buildGatewayModelKey(model.id);
        const modelInstance = await this.getModelInstance(modelKey, llmProviders);
        return {
          modelKey,
          modelInstance,
          isInstance: true, // Gateway models are always instance-level
          tags: model.tags,
        };
      }
    }

    // 2. Check custom LLM providers
    for (const provider of llmProviders) {
      const models = provider.models?.split(',').map((m) => m.trim()) ?? [];
      for (const model of models) {
        const modelConfig = provider.modelConfigs?.[model];
        if (!modelConfig) continue;

        // Check tags (new format) or ability (backward compatibility)
        const hasVision = modelConfig.tags?.includes('vision') || modelConfig.ability?.image;
        if (hasVision) {
          const modelKey = `${provider.type}@${model}@${provider.name}`;
          const modelInstance = await this.getModelInstance(modelKey, llmProviders);
          // Convert ability to tags for backward compatibility
          const tags: GatewayModelTag[] =
            modelConfig.tags ?? this.abilityToTags(modelConfig.ability ?? {});
          return {
            modelKey,
            modelInstance,
            isInstance: !!provider.isInstance,
            tags,
          };
        }
      }
    }

    return undefined;
  }
}
