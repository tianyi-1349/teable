import { describe, expect, it } from 'vitest';
import { resolveAttachmentCover } from './utils';

const IMAGE_URL = 'https://cdn.example.com/file.png';

describe('resolveAttachmentCover', () => {
  it('prefers large thumbnail when provided', () => {
    expect(
      resolveAttachmentCover({
        mimetype: 'image/png',
        presignedUrl: IMAGE_URL,
        lgThumbnailUrl: 'https://cdn.example.com/file-lg.png',
      })
    ).toBe('https://cdn.example.com/file-lg.png');
  });

  it('falls back to presigned url for images when thumbnail is missing', () => {
    expect(
      resolveAttachmentCover({
        mimetype: 'image/png',
        presignedUrl: IMAGE_URL,
      })
    ).toBe(IMAGE_URL);
  });

  it('does not fall back to presigned url for pdf when thumbnail is missing', () => {
    expect(
      resolveAttachmentCover({
        mimetype: 'application/pdf',
        presignedUrl: 'https://cdn.example.com/file.pdf',
      })
    ).not.toBe('https://cdn.example.com/file.pdf');
  });
});
