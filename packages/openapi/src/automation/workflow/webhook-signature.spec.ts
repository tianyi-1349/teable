import { describe, expect, it, vi } from 'vitest';
import {
  buildWorkflowWebhookSignaturePayload,
  createWorkflowWebhookSignature,
  createWorkflowWebhookSignatureHeaders,
  normalizeWorkflowWebhookSignature,
} from './webhook-signature';

const signatureSecret = 'sig-secret';
const signatureTimestamp = '1770000000';
const signatureRawBody = '{"message":"hello"}';
const expectedSignature = 'a98ecf4ca2d26d7a9bf55a6f37a44a1f790a8d6e5597f2c069995a24cf6b623a';

describe('workflow webhook signature helpers', () => {
  it('creates signatures from timestamp and raw body', () => {
    expect(
      buildWorkflowWebhookSignaturePayload({ timestamp: signatureTimestamp, rawBody: 'body' })
    ).toBe('1770000000.body');
    expect(
      createWorkflowWebhookSignature({
        secret: signatureSecret,
        timestamp: signatureTimestamp,
        rawBody: signatureRawBody,
      })
    ).toBe(expectedSignature);
  });

  it('creates trigger headers with sha256 prefix', () => {
    expect(
      createWorkflowWebhookSignatureHeaders({
        secret: signatureSecret,
        timestamp: signatureTimestamp,
        rawBody: signatureRawBody,
      })
    ).toEqual({
      'x-webhook-signature': `sha256=${expectedSignature}`,
      'x-webhook-timestamp': signatureTimestamp,
    });
  });

  it('creates trigger headers with custom header names', () => {
    expect(
      createWorkflowWebhookSignatureHeaders({
        secret: signatureSecret,
        timestamp: signatureTimestamp,
        rawBody: signatureRawBody,
        signatureHeader: 'X-Custom-Signature',
        timestampHeader: 'X-Custom-Timestamp',
      })
    ).toEqual({
      'X-Custom-Signature': `sha256=${expectedSignature}`,
      'X-Custom-Timestamp': signatureTimestamp,
    });
  });

  it('defaults timestamp to current unix seconds', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-04T00:00:30.000Z'));

    expect(
      createWorkflowWebhookSignatureHeaders({
        secret: signatureSecret,
        rawBody: '{}',
      })['x-webhook-timestamp']
    ).toBe('1770163230');

    vi.useRealTimers();
  });

  it('normalizes sha256 signature prefix', () => {
    expect(normalizeWorkflowWebhookSignature('sha256=abc')).toBe('abc');
    expect(normalizeWorkflowWebhookSignature('SHA256=abc')).toBe('abc');
  });
});
