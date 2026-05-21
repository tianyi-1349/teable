import { FieldKeyType, FieldType } from '@teable/core';
import { describe, expect, it } from 'vitest';
import {
  chunkTokens,
  collectAttachmentPreviewTokens,
  collectAttachmentThumbnailTokens,
  decorateAttachmentValue,
  decorateRecordsAttachmentFields,
} from './record-attachment-preview';

describe('collectAttachmentPreviewTokens', () => {
  it('collects attachment tokens and image thumbnail cache tokens once', () => {
    const tokens = collectAttachmentPreviewTokens(
      [
        {
          id: 'rec1',
          v: 1,
          type: 'json0',
          data: {
            id: 'rec1',
            fields: {
              Attachments: [
                {
                  token: 'tok-image',
                  path: 'path/to/image.png',
                  name: 'image.png',
                  mimetype: 'image/png',
                  width: 100,
                  height: 80,
                },
                {
                  token: 'tok-image',
                  path: 'path/to/image.png',
                  name: 'image.png',
                  mimetype: 'image/png',
                  width: 100,
                  height: 80,
                },
                {
                  token: 'tok-file',
                  path: 'path/to/file.txt',
                  name: 'file.txt',
                  mimetype: 'text/plain',
                },
              ],
            },
          },
        },
      ],
      [{ type: FieldType.Attachment, id: 'fld1', name: 'Attachments', dbFieldName: 'attachments' }],
      FieldKeyType.Name
    );

    expect(tokens).toEqual(['image.png_sm', 'image.png_lg', 'tok-image', 'tok-file']);
  });
});

describe('collectAttachmentThumbnailTokens', () => {
  it('collects thumbnail lookup tokens for images and pdfs only', () => {
    const tokens = collectAttachmentThumbnailTokens(
      [
        {
          id: 'rec1',
          v: 1,
          type: 'json0',
          data: {
            id: 'rec1',
            fields: {
              fld1: [
                { token: 'img-token', path: 'img.png', name: 'img.png', mimetype: 'image/png' },
                {
                  token: 'pdf-token',
                  path: 'doc.pdf',
                  name: 'doc.pdf',
                  mimetype: 'application/pdf',
                },
                { token: 'txt-token', path: 'note.txt', name: 'note.txt', mimetype: 'text/plain' },
              ],
            },
          },
        },
      ],
      [{ type: FieldType.Attachment, id: 'fld1', name: 'Attachments', dbFieldName: 'attachments' }],
      FieldKeyType.Id
    );

    expect(tokens).toEqual(['img-token', 'pdf-token']);
  });
});

describe('chunkTokens', () => {
  it('splits token batches by the requested size', () => {
    expect(chunkTokens(['a', 'b', 'c', 'd', 'e'], 2)).toEqual([['a', 'b'], ['c', 'd'], ['e']]);
  });
});

describe('decorateAttachmentValue', () => {
  it('falls back to the presigned url for image thumbnails', () => {
    expect(
      decorateAttachmentValue(
        {
          id: 'att-img',
          token: 'img-token',
          path: 'img.png',
          name: 'img.png',
          size: 1,
          mimetype: 'image/png',
        },
        {
          presignedUrl: 'https://cdn.example.com/file',
        }
      )
    ).toMatchObject({
      presignedUrl: 'https://cdn.example.com/file',
      smThumbnailUrl: 'https://cdn.example.com/file',
      lgThumbnailUrl: 'https://cdn.example.com/file',
    });
  });

  it('keeps non-image thumbnail urls optional', () => {
    expect(
      decorateAttachmentValue(
        {
          id: 'att-pdf',
          token: 'pdf-token',
          path: 'doc.pdf',
          name: 'doc.pdf',
          size: 1,
          mimetype: 'application/pdf',
        },
        {
          presignedUrl: 'https://cdn.example.com/doc',
        }
      )
    ).toMatchObject({
      presignedUrl: 'https://cdn.example.com/doc',
      smThumbnailUrl: undefined,
      lgThumbnailUrl: undefined,
    });
  });
});

describe('decorateRecordsAttachmentFields', () => {
  it('decorates only attachment fields and keeps other fields unchanged', async () => {
    const records = [
      {
        id: 'rec1',
        v: 1,
        type: 'json0',
        data: {
          id: 'rec1',
          fields: {
            Attachments: [
              {
                id: 'att1',
                token: 'tok1',
                path: 'a.png',
                name: 'a.png',
                size: 1,
                mimetype: 'image/png',
              },
            ],
            Title: 'hello',
          },
        },
      },
    ];

    const result = await decorateRecordsAttachmentFields(
      records as never,
      [
        { type: FieldType.Attachment, id: 'fld1', name: 'Attachments', dbFieldName: 'attachments' },
        { type: FieldType.SingleLineText, id: 'fld2', name: 'Title', dbFieldName: 'title' },
      ],
      FieldKeyType.Name,
      async (cellValue) =>
        cellValue?.map((item) => ({
          ...item,
          presignedUrl: `https://cdn.example.com/${item.token}`,
        })) ?? null
    );

    expect(result[0]?.data.fields.Attachments).toEqual([
      expect.objectContaining({ presignedUrl: 'https://cdn.example.com/tok1' }),
    ]);
    expect(result[0]?.data.fields.Title).toBe('hello');
  });
});
