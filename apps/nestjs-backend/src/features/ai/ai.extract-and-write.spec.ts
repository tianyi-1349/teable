/* eslint-disable sonarjs/no-duplicate-string */
import { FieldKeyType, FieldType } from '@teable/core';
import { generateText } from 'ai';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('ai', () => {
  return {
    createGateway: vi.fn(),
    generateText: vi.fn(),
    streamText: vi.fn(),
  };
});

import { AiService } from './ai.service';

const mockedGenerateText = vi.mocked(generateText);

describe('AiService extract and write', () => {
  const prismaService = {
    tableMeta: {
      findFirstOrThrow: vi.fn().mockResolvedValue({ id: 'tbl123' }),
    },
    field: {
      findMany: vi.fn(),
    },
  };

  const permissionService = {
    validPermissions: vi.fn().mockResolvedValue(undefined),
  };

  const recordService = {
    getRecord: vi.fn(),
  };

  const recordOpenApiService = {
    uploadAttachment: vi.fn(),
  };

  const service = new AiService(
    {} as never,
    prismaService as never,
    {} as never,
    {} as never,
    recordService as never,
    recordOpenApiService as never,
    permissionService as never
  );

  const serviceWithInternals = service as unknown as {
    getGenerationModelInstance: (baseId: string, ro: unknown) => Promise<unknown>;
    recordOperation: (baseId: string, body: unknown) => Promise<unknown>;
  };

  beforeEach(() => {
    vi.resetAllMocks();
    prismaService.tableMeta.findFirstOrThrow.mockResolvedValue({ id: 'tbl123' });
    permissionService.validPermissions.mockResolvedValue(undefined);
    recordService.getRecord.mockReset();
    recordOpenApiService.uploadAttachment.mockReset();
  });

  it('should preview normalized extracted values', async () => {
    prismaService.field.findMany.mockResolvedValue([
      {
        id: 'fldText',
        name: 'Title',
        type: FieldType.SingleLineText,
        options: null,
        isComputed: false,
      },
      {
        id: 'fldSelect',
        name: 'Status',
        type: FieldType.SingleSelect,
        options: JSON.stringify({ choices: [{ name: 'Open' }, { name: 'Closed' }] }),
        isComputed: false,
      },
      {
        id: 'fldCheck',
        name: 'Approved',
        type: FieldType.Checkbox,
        options: null,
        isComputed: false,
      },
      { id: 'fldNumber', name: 'Amount', type: FieldType.Number, options: null, isComputed: false },
      { id: 'fldDate', name: 'Due Date', type: FieldType.Date, options: null, isComputed: false },
      {
        id: 'fldRating',
        name: 'Priority',
        type: FieldType.Rating,
        options: JSON.stringify({ max: 3 }),
        isComputed: false,
      },
    ]);

    vi.spyOn(serviceWithInternals, 'getGenerationModelInstance').mockResolvedValue({} as never);
    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify({
        fldText: 'ACME Contract',
        fldSelect: 'closed',
        fldCheck: 'yes',
        fldNumber: '1,250.5',
        fldDate: '2026-05-03 12:30:00Z',
        fldRating: 2.2,
      }),
    } as never);

    const result = await service.previewExtractAndWrite('base123', {
      tableId: 'tbl123',
      sourceText: 'Contract approved for ACME. Amount is 1250.5 and status is closed.',
    });

    expect(permissionService.validPermissions).toHaveBeenCalledWith('tbl123', ['record|create']);
    expect(result.warnings).toEqual([]);
    expect(result.fields).toEqual([
      {
        fieldId: 'fldText',
        name: 'Title',
        type: FieldType.SingleLineText,
        status: 'filled',
        value: 'ACME Contract',
        choices: undefined,
      },
      {
        fieldId: 'fldSelect',
        name: 'Status',
        type: FieldType.SingleSelect,
        status: 'filled',
        value: 'Closed',
        choices: ['Open', 'Closed'],
      },
      {
        fieldId: 'fldCheck',
        name: 'Approved',
        type: FieldType.Checkbox,
        status: 'filled',
        value: true,
        choices: undefined,
      },
      {
        fieldId: 'fldNumber',
        name: 'Amount',
        type: FieldType.Number,
        status: 'filled',
        value: 1250.5,
        choices: undefined,
      },
      {
        fieldId: 'fldDate',
        name: 'Due Date',
        type: FieldType.Date,
        status: 'filled',
        value: '2026-05-03T12:30:00.000Z',
        choices: undefined,
      },
      {
        fieldId: 'fldRating',
        name: 'Priority',
        type: FieldType.Rating,
        status: 'filled',
        value: 2,
        choices: undefined,
      },
    ]);
  });

  it('should mark invalid rating values outside field max', async () => {
    prismaService.field.findMany.mockResolvedValue([
      {
        id: 'fldRating',
        name: 'Priority',
        type: FieldType.Rating,
        options: JSON.stringify({ max: 3 }),
        isComputed: false,
      },
    ]);

    vi.spyOn(serviceWithInternals, 'getGenerationModelInstance').mockResolvedValue({} as never);
    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify({
        fldRating: 5,
      }),
    } as never);

    const result = await service.previewExtractAndWrite('base123', {
      tableId: 'tbl123',
      sourceText: 'Priority is five stars.',
    });

    expect(result.fields).toEqual([
      {
        fieldId: 'fldRating',
        name: 'Priority',
        type: FieldType.Rating,
        status: 'invalid',
        value: null,
        reason: 'AI returned a value that does not match the field type.',
        choices: undefined,
      },
    ]);
  });

  it('should mark object values invalid for text fields', async () => {
    prismaService.field.findMany.mockResolvedValue([
      {
        id: 'fldText',
        name: 'Title',
        type: FieldType.SingleLineText,
        options: null,
        isComputed: false,
      },
    ]);

    vi.spyOn(serviceWithInternals, 'getGenerationModelInstance').mockResolvedValue({} as never);
    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify({
        fldText: { nested: 'value' },
      }),
    } as never);

    const result = await service.previewExtractAndWrite('base123', {
      tableId: 'tbl123',
      sourceText: 'Title should not accept object payloads.',
    });

    expect(result.fields).toEqual([
      {
        fieldId: 'fldText',
        name: 'Title',
        type: FieldType.SingleLineText,
        status: 'invalid',
        value: null,
        reason: 'AI returned a value that does not match the field type.',
        choices: undefined,
      },
    ]);
  });

  it('should preview attachment fields as normalized URL arrays', async () => {
    prismaService.field.findMany.mockResolvedValue([
      {
        id: 'fldAttachment',
        name: 'Screenshots',
        type: FieldType.Attachment,
        options: null,
        isComputed: false,
      },
    ]);

    vi.spyOn(serviceWithInternals, 'getGenerationModelInstance').mockResolvedValue({} as never);
    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify({
        fldAttachment: [
          'https://cdn.example.com/a.png',
          'invalid-url',
          'https://cdn.example.com/b.png',
        ],
      }),
    } as never);

    const result = await service.previewExtractAndWrite('base123', {
      tableId: 'tbl123',
      sourceText:
        'Use https://cdn.example.com/a.png and https://cdn.example.com/b.png as screenshots.',
    });

    expect(result.fields).toEqual([
      {
        fieldId: 'fldAttachment',
        name: 'Screenshots',
        type: FieldType.Attachment,
        status: 'filled',
        value: ['https://cdn.example.com/a.png', 'https://cdn.example.com/b.png'],
        choices: undefined,
      },
    ]);
  });

  it('should include existing attachments in update preview', async () => {
    prismaService.field.findMany.mockResolvedValue([
      {
        id: 'fldAttachment',
        name: 'Screenshots',
        type: FieldType.Attachment,
        options: null,
        isComputed: false,
      },
    ]);

    recordService.getRecord.mockResolvedValue({
      id: 'rec123',
      fields: {
        fldAttachment: [
          {
            id: 'actExisting1',
            name: 'existing-a.png',
            path: 'attachments/existing-a.png',
            token: 'tok-existing-a',
            size: 123,
            mimetype: 'image/png',
            presignedUrl: 'https://cdn.example.com/existing-a.png',
          },
        ],
      },
    });

    vi.spyOn(serviceWithInternals, 'getGenerationModelInstance').mockResolvedValue({} as never);
    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify({
        fldAttachment: ['https://cdn.example.com/new-a.png'],
      }),
    } as never);

    const result = await service.previewExtractAndWrite('base123', {
      tableId: 'tbl123',
      recordId: 'rec123',
      sourceText: 'Replace the screenshots and keep one previous file.',
    });

    expect(recordService.getRecord).toHaveBeenCalledWith(
      'tbl123',
      'rec123',
      {
        projection: ['fldAttachment'],
        fieldKeyType: FieldKeyType.Id,
      },
      true,
      true
    );
    expect(result.fields).toEqual([
      {
        fieldId: 'fldAttachment',
        name: 'Screenshots',
        type: FieldType.Attachment,
        status: 'filled',
        value: ['https://cdn.example.com/new-a.png'],
        choices: undefined,
        existingAttachments: [
          {
            id: 'actExisting1',
            name: 'existing-a.png',
            url: 'https://cdn.example.com/existing-a.png',
          },
        ],
        keepExistingAttachmentIds: [],
      },
    ]);
  });

  it('should validate single line text fields by showAs semantics', async () => {
    prismaService.field.findMany.mockResolvedValue([
      {
        id: 'fldEmail',
        name: 'Contact Email',
        type: FieldType.SingleLineText,
        options: JSON.stringify({ showAs: { type: 'email' } }),
        isComputed: false,
      },
      {
        id: 'fldUrl',
        name: 'Website',
        type: FieldType.SingleLineText,
        options: JSON.stringify({ showAs: { type: 'url' } }),
        isComputed: false,
      },
      {
        id: 'fldPhone',
        name: 'Phone',
        type: FieldType.SingleLineText,
        options: JSON.stringify({ showAs: { type: 'phone' } }),
        isComputed: false,
      },
    ]);

    vi.spyOn(serviceWithInternals, 'getGenerationModelInstance').mockResolvedValue({} as never);
    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify({
        fldEmail: 'ops@acme.com',
        fldUrl: 'not-a-url',
        fldPhone: '+1 (555) 123-4567',
      }),
    } as never);

    const result = await service.previewExtractAndWrite('base123', {
      tableId: 'tbl123',
      sourceText: 'Email ops@acme.com, website is invalid, phone is +1 (555) 123-4567.',
    });

    expect(result.fields).toEqual([
      {
        fieldId: 'fldEmail',
        name: 'Contact Email',
        type: FieldType.SingleLineText,
        status: 'filled',
        value: 'ops@acme.com',
        choices: undefined,
      },
      {
        fieldId: 'fldUrl',
        name: 'Website',
        type: FieldType.SingleLineText,
        status: 'invalid',
        value: null,
        reason: 'AI returned a value that does not match the field type.',
        choices: undefined,
      },
      {
        fieldId: 'fldPhone',
        name: 'Phone',
        type: FieldType.SingleLineText,
        status: 'filled',
        value: '+1 (555) 123-4567',
        choices: undefined,
      },
    ]);
  });

  it('should expose barcode and qrcode as writable text fields and skip computed auto number', async () => {
    prismaService.field.findMany.mockResolvedValue([
      {
        id: 'fldBarcode',
        name: 'Barcode',
        type: FieldType.SingleLineText,
        options: JSON.stringify({ showAs: { type: 'barcode' } }),
        isComputed: false,
      },
      {
        id: 'fldQRCode',
        name: 'QR Code',
        type: FieldType.SingleLineText,
        options: JSON.stringify({ showAs: { type: 'qrcode' } }),
        isComputed: false,
      },
      {
        id: 'fldAutoNumber',
        name: 'ID',
        type: FieldType.AutoNumber,
        options: JSON.stringify({ expression: 'AUTO_NUMBER()' }),
        isComputed: true,
      },
    ]);

    vi.spyOn(serviceWithInternals, 'getGenerationModelInstance').mockResolvedValue({} as never);
    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify({
        fldBarcode: 'ABC-123-XYZ',
        fldQRCode: 'https://example.com/qr/42',
      }),
    } as never);

    const result = await service.previewExtractAndWrite('base123', {
      tableId: 'tbl123',
      sourceText: 'Barcode is ABC-123-XYZ and QR code points to https://example.com/qr/42.',
    });

    expect(result.fields).toEqual([
      {
        fieldId: 'fldBarcode',
        name: 'Barcode',
        type: FieldType.SingleLineText,
        status: 'filled',
        value: 'ABC-123-XYZ',
        choices: undefined,
      },
      {
        fieldId: 'fldQRCode',
        name: 'QR Code',
        type: FieldType.SingleLineText,
        status: 'filled',
        value: 'https://example.com/qr/42',
        choices: undefined,
      },
    ]);
  });

  it('should include auto number as read-only context when previewing updates', async () => {
    prismaService.field.findMany
      .mockResolvedValueOnce([
        {
          id: 'fldText',
          name: 'Title',
          type: FieldType.SingleLineText,
          options: null,
          isComputed: false,
        },
      ])
      .mockResolvedValueOnce([
        {
          id: 'fldAutoNumber',
          name: 'Order No.',
          type: FieldType.AutoNumber,
          options: JSON.stringify({ expression: 'AUTO_NUMBER()' }),
        },
      ]);
    recordService.getRecord.mockResolvedValue({
      id: 'rec123',
      fields: {
        fldAutoNumber: 42,
      },
    });

    vi.spyOn(serviceWithInternals, 'getGenerationModelInstance').mockResolvedValue({} as never);
    mockedGenerateText.mockResolvedValue({
      text: JSON.stringify({
        fldText: 'Contract #42',
      }),
    } as never);

    await service.previewExtractAndWrite('base123', {
      tableId: 'tbl123',
      recordId: 'rec123',
      sourceText: 'Generate a title for this existing record.',
    });

    expect(recordService.getRecord).toHaveBeenCalledWith(
      'tbl123',
      'rec123',
      {
        projection: ['fldAutoNumber'],
        fieldKeyType: FieldKeyType.Id,
      },
      true,
      true
    );
    expect(mockedGenerateText).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.stringContaining(
          'Current read-only field context:\n- fldAutoNumber | Order No. | autoNumber | 42'
        ),
      })
    );
  });

  it('should apply only filled fields through recordOperation', async () => {
    prismaService.field.findMany.mockResolvedValue([
      {
        id: 'fldText',
        name: 'Title',
        type: FieldType.SingleLineText,
        options: null,
        isComputed: false,
      },
      { id: 'fldNumber', name: 'Amount', type: FieldType.Number, options: null, isComputed: false },
    ]);

    vi.spyOn(serviceWithInternals, 'recordOperation').mockResolvedValue({
      action: 'create',
      tableId: 'tbl123',
      records: [{ id: 'rec123', fields: { Title: 'Invoice', Amount: 900 } }],
    } as never);

    const result = await service.applyExtractAndWrite('base123', {
      tableId: 'tbl123',
      fields: [
        {
          fieldId: 'fldText',
          name: 'Title',
          type: FieldType.SingleLineText,
          value: 'Invoice',
        },
        {
          fieldId: 'fldNumber',
          name: 'Amount',
          type: FieldType.Number,
          value: null,
        },
      ],
    });

    expect(permissionService.validPermissions).toHaveBeenCalledWith('tbl123', ['record|create']);
    expect(serviceWithInternals.recordOperation).toHaveBeenCalledWith('base123', {
      action: 'create',
      tableId: 'tbl123',
      payload: {
        fieldKeyType: FieldKeyType.Name,
        records: [
          {
            fields: {
              Title: 'Invoice',
            },
          },
        ],
      },
    });
    expect(result).toEqual({
      operation: {
        action: 'create',
        tableId: 'tbl123',
        records: [{ id: 'rec123', fields: { Title: 'Invoice', Amount: 900 } }],
      },
      appliedFieldIds: ['fldText'],
    });
  });

  it('should create record first and then upload attachment URLs', async () => {
    prismaService.field.findMany.mockResolvedValue([
      {
        id: 'fldText',
        name: 'Title',
        type: FieldType.SingleLineText,
        options: null,
        isComputed: false,
      },
      {
        id: 'fldAttachment',
        name: 'Screenshots',
        type: FieldType.Attachment,
        options: null,
        isComputed: false,
      },
    ]);

    vi.spyOn(serviceWithInternals, 'recordOperation').mockResolvedValue({
      action: 'create',
      tableId: 'tbl123',
      records: [{ id: 'rec123', fields: { Title: 'Invoice' } }],
    } as never);
    recordOpenApiService.uploadAttachment
      .mockResolvedValueOnce({
        id: 'rec123',
        fields: {
          fldAttachment: [{ id: 'att1', url: 'https://cdn.example.com/a.png' }],
        },
      })
      .mockResolvedValueOnce({
        id: 'rec123',
        fields: {
          fldAttachment: [
            { id: 'att1', url: 'https://cdn.example.com/a.png' },
            { id: 'att2', url: 'https://cdn.example.com/b.png' },
          ],
        },
      });

    const result = await service.applyExtractAndWrite('base123', {
      tableId: 'tbl123',
      fields: [
        {
          fieldId: 'fldText',
          name: 'Title',
          type: FieldType.SingleLineText,
          value: 'Invoice',
        },
        {
          fieldId: 'fldAttachment',
          name: 'Screenshots',
          type: FieldType.Attachment,
          value: ['https://cdn.example.com/a.png', 'https://cdn.example.com/b.png'],
        },
      ],
    });

    expect(serviceWithInternals.recordOperation).toHaveBeenCalledWith('base123', {
      action: 'create',
      tableId: 'tbl123',
      payload: {
        fieldKeyType: FieldKeyType.Name,
        records: [
          {
            fields: {
              Title: 'Invoice',
            },
          },
        ],
      },
    });
    expect(recordOpenApiService.uploadAttachment).toHaveBeenNthCalledWith(
      1,
      'tbl123',
      'rec123',
      'fldAttachment',
      undefined,
      'https://cdn.example.com/a.png'
    );
    expect(recordOpenApiService.uploadAttachment).toHaveBeenNthCalledWith(
      2,
      'tbl123',
      'rec123',
      'fldAttachment',
      undefined,
      'https://cdn.example.com/b.png'
    );
    expect(result).toEqual({
      operation: {
        action: 'create',
        tableId: 'tbl123',
        records: [
          {
            id: 'rec123',
            fields: {
              fldAttachment: [
                { id: 'att1', url: 'https://cdn.example.com/a.png' },
                { id: 'att2', url: 'https://cdn.example.com/b.png' },
              ],
            },
          },
        ],
      },
      appliedFieldIds: ['fldText', 'fldAttachment'],
    });
  });

  it('should replace attachment values on update before uploading new URLs', async () => {
    prismaService.field.findMany.mockResolvedValue([
      {
        id: 'fldText',
        name: 'Title',
        type: FieldType.SingleLineText,
        options: null,
        isComputed: false,
      },
      {
        id: 'fldAttachment',
        name: 'Screenshots',
        type: FieldType.Attachment,
        options: null,
        isComputed: false,
      },
    ]);
    recordService.getRecord.mockResolvedValue({
      id: 'rec123',
      fields: {
        fldAttachment: [
          {
            id: 'attExisting1',
            name: 'existing-a.png',
            path: 'attachments/existing-a.png',
            token: 'tok-existing-a',
            size: 123,
            mimetype: 'image/png',
          },
          {
            id: 'actExisting2',
            name: 'existing-b.png',
            path: 'attachments/existing-b.png',
            token: 'tok-existing-b',
            size: 456,
            mimetype: 'image/png',
          },
        ],
      },
    });

    vi.spyOn(serviceWithInternals, 'recordOperation').mockResolvedValue({
      action: 'update',
      tableId: 'tbl123',
      records: [{ id: 'rec123', fields: { Title: 'Updated Invoice' } }],
    } as never);
    recordOpenApiService.uploadAttachment.mockResolvedValue({
      id: 'rec123',
      fields: {
        fldAttachment: [{ id: 'att1', url: 'https://cdn.example.com/a.png' }],
      },
    });

    const result = await service.applyExtractAndWrite('base123', {
      tableId: 'tbl123',
      recordId: 'rec123',
      fields: [
        {
          fieldId: 'fldText',
          name: 'Title',
          type: FieldType.SingleLineText,
          value: 'Updated Invoice',
        },
        {
          fieldId: 'fldAttachment',
          name: 'Screenshots',
          type: FieldType.Attachment,
          value: ['https://cdn.example.com/a.png'],
          keepExistingAttachmentIds: ['actExisting2'],
        },
      ],
    });

    expect(serviceWithInternals.recordOperation).toHaveBeenCalledWith('base123', {
      action: 'update',
      tableId: 'tbl123',
      payload: {
        fieldKeyType: FieldKeyType.Name,
        records: [
          {
            id: 'rec123',
            fields: {
              Title: 'Updated Invoice',
              Screenshots: [
                {
                  id: 'actExisting2',
                  name: 'existing-b.png',
                  path: 'attachments/existing-b.png',
                  token: 'tok-existing-b',
                  size: 456,
                  mimetype: 'image/png',
                },
              ],
            },
          },
        ],
        aiContext: {},
      },
    });
    expect(recordOpenApiService.uploadAttachment).toHaveBeenCalledWith(
      'tbl123',
      'rec123',
      'fldAttachment',
      undefined,
      'https://cdn.example.com/a.png'
    );
    expect(result).toEqual({
      operation: {
        action: 'update',
        tableId: 'tbl123',
        records: [
          {
            id: 'rec123',
            fields: {
              fldAttachment: [{ id: 'att1', url: 'https://cdn.example.com/a.png' }],
            },
          },
        ],
      },
      appliedFieldIds: ['fldText', 'fldAttachment'],
    });
  });

  it('should clear attachment values on update when the edited preview is empty', async () => {
    prismaService.field.findMany.mockResolvedValue([
      {
        id: 'fldAttachment',
        name: 'Screenshots',
        type: FieldType.Attachment,
        options: null,
        isComputed: false,
      },
    ]);

    vi.spyOn(serviceWithInternals, 'recordOperation').mockResolvedValue({
      action: 'update',
      tableId: 'tbl123',
      records: [{ id: 'rec123', fields: { Screenshots: [] } }],
    } as never);

    const result = await service.applyExtractAndWrite('base123', {
      tableId: 'tbl123',
      recordId: 'rec123',
      fields: [
        {
          fieldId: 'fldAttachment',
          name: 'Screenshots',
          type: FieldType.Attachment,
          value: null,
        },
      ],
    });

    expect(serviceWithInternals.recordOperation).toHaveBeenCalledWith('base123', {
      action: 'update',
      tableId: 'tbl123',
      payload: {
        fieldKeyType: FieldKeyType.Name,
        records: [
          {
            id: 'rec123',
            fields: {
              Screenshots: [],
            },
          },
        ],
        aiContext: {},
      },
    });
    expect(recordOpenApiService.uploadAttachment).not.toHaveBeenCalled();
    expect(result).toEqual({
      operation: {
        action: 'update',
        tableId: 'tbl123',
        records: [{ id: 'rec123', fields: { Screenshots: [] } }],
      },
      appliedFieldIds: ['fldAttachment'],
    });
  });
});
