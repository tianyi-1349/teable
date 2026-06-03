import { describe, expect, it } from 'vitest';
import {
  assertWorkflowWebhookTimestamp,
  buildWorkflowWebhookSignaturePayload,
  createWorkflowWebhookSignature,
  isWorkflowWebhookSignatureMatch,
  normalizeWorkflowWebhookSignature,
} from './workflow-webhook-signature';

describe('workflow webhook signature helpers', () => {
  it('creates signatures from timestamp and raw body', () => {
    const signature = createWorkflowWebhookSignature({
      secret: 'sig-secret',
      timestamp: '1770000000',
      rawBody: '{"message":"hello"}',
    });

    expect(buildWorkflowWebhookSignaturePayload({ timestamp: '1770000000', rawBody: 'body' })).toBe(
      '1770000000.body'
    );
    expect(signature).toBe('a98ecf4ca2d26d7a9bf55a6f37a44a1f790a8d6e5597f2c069995a24cf6b623a');
  });

  it('matches signatures with optional sha256 prefix', () => {
    const input = {
      secret: 'sig-secret',
      timestamp: '1770000000',
      rawBody: '{"message":"hello"}',
    };
    const signature = createWorkflowWebhookSignature(input);

    expect(normalizeWorkflowWebhookSignature(`sha256=${signature}`)).toBe(signature);
    expect(isWorkflowWebhookSignatureMatch({ ...input, signature: `sha256=${signature}` })).toBe(
      true
    );
    expect(isWorkflowWebhookSignatureMatch({ ...input, signature: 'wrong' })).toBe(false);
  });

  it('validates timestamps with configured tolerance', () => {
    expect(
      assertWorkflowWebhookTimestamp({
        timestamp: '1000',
        toleranceSeconds: 60,
        nowSeconds: 1040,
      })
    ).toBe(true);
    expect(
      assertWorkflowWebhookTimestamp({
        timestamp: '1000',
        toleranceSeconds: 60,
        nowSeconds: 1061,
      })
    ).toBe(false);
    expect(assertWorkflowWebhookTimestamp({ timestamp: 'invalid', nowSeconds: 1000 })).toBe(false);
  });
});
