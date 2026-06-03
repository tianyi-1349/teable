import { describe, expect, it, vi } from 'vitest';
import { axios } from '../../axios';
import { triggerWebhookWorkflow } from './trigger-webhook';

vi.mock('../../axios', () => ({
  axios: {
    post: vi.fn(),
  },
}));

describe('triggerWebhookWorkflow', () => {
  it('creates webhook signature headers from signature secret and raw body', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { runId: 'wrun123' } });

    await triggerWebhookWorkflow(
      'bse123',
      'wfl123',
      { message: 'hello' },
      {
        webhookSecret: 'plain-secret',
        signatureSecret: 'sig-secret',
        rawBody: '{"message":"hello"}',
        webhookTimestamp: '1770000000',
      }
    );

    expect(axios.post).toHaveBeenCalledWith(
      '/base/bse123/workflow/wfl123/webhook',
      { message: 'hello' },
      {
        headers: {
          'x-webhook-secret': 'plain-secret',
          'x-webhook-signature':
            'sha256=a98ecf4ca2d26d7a9bf55a6f37a44a1f790a8d6e5597f2c069995a24cf6b623a',
          'x-webhook-timestamp': '1770000000',
        },
      }
    );
  });

  it('creates custom webhook signature headers from signature secret and raw body', async () => {
    vi.mocked(axios.post).mockResolvedValue({ data: { runId: 'wrun123' } });

    await triggerWebhookWorkflow(
      'bse123',
      'wfl123',
      { message: 'hello' },
      {
        signatureSecret: 'sig-secret',
        rawBody: '{"message":"hello"}',
        webhookTimestamp: '1770000000',
        signatureHeader: 'X-Custom-Signature',
        timestampHeader: 'X-Custom-Timestamp',
      }
    );

    expect(axios.post).toHaveBeenCalledWith(
      '/base/bse123/workflow/wfl123/webhook',
      { message: 'hello' },
      {
        headers: {
          'X-Custom-Signature':
            'sha256=a98ecf4ca2d26d7a9bf55a6f37a44a1f790a8d6e5597f2c069995a24cf6b623a',
          'X-Custom-Timestamp': '1770000000',
        },
      }
    );
  });
});
