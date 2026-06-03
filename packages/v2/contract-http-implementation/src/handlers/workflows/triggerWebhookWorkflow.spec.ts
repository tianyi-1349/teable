import type { IWorkflowRunVo } from '@teable/openapi';
import { describe, expect, it, vi } from 'vitest';
import { executeTriggerWebhookWorkflowEndpoint } from './triggerWebhookWorkflow';

const run: IWorkflowRunVo = {
  id: 'wfr123',
  workflowId: 'wfl123',
  snapshotId: 'wsn123',
  triggerType: 'webhook',
  status: 'completed',
  input: { message: 'hello' },
  startedTime: '2026-05-31T00:00:00.000Z',
  finishedTime: '2026-05-31T00:00:01.000Z',
  durationMs: 1000,
  createdBy: 'usr123',
};

class HttpLikeError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    private readonly status: number
  ) {
    super(message);
  }

  getStatus() {
    return this.status;
  }
}

describe('executeTriggerWebhookWorkflowEndpoint', () => {
  it('wraps a webhook workflow run in the v2 response contract', async () => {
    const triggerWebhookWorkflow = vi.fn(async () => run);

    const result = await executeTriggerWebhookWorkflowEndpoint(
      {
        baseId: 'bse123',
        workflowId: 'wfl123',
        body: { message: 'hello' },
        webhookSecret: 'plain-secret',
        webhookSignature: 'sha256=abc',
        webhookTimestamp: '1770000000',
      },
      triggerWebhookWorkflow
    );

    expect(triggerWebhookWorkflow).toHaveBeenCalledWith(
      'bse123',
      'wfl123',
      { message: 'hello' },
      'plain-secret',
      'sha256=abc',
      '1770000000'
    );
    expect(result).toEqual({ status: 201, body: { ok: true, data: { run } } });
  });

  it('returns validation error for invalid input', async () => {
    const result = await executeTriggerWebhookWorkflowEndpoint(
      { workflowId: 'wfl123' },
      vi.fn(async () => run)
    );

    expect(result.status).toBe(400);
    expect(result.body.ok).toBe(false);
  });

  it('returns output validation error when handler returns an invalid run', async () => {
    const result = await executeTriggerWebhookWorkflowEndpoint(
      { baseId: 'bse123', workflowId: 'wfl123' },
      vi.fn(async () => ({ ...run, id: 123 }) as never)
    );

    expect(result.status).toBe(500);
    expect(result.body.ok).toBe(false);
  });

  it.each([401, 404, 413, 429] as const)(
    'preserves supported http-like error status %s',
    async (status) => {
      const result = await executeTriggerWebhookWorkflowEndpoint(
        { baseId: 'bse123', workflowId: 'wfl123' },
        vi.fn(async () => {
          throw new HttpLikeError('Webhook rejected', 'webhook_rejected', status);
        })
      );

      expect(result).toEqual({
        status,
        body: {
          ok: false,
          error: { code: 'webhook_rejected', message: 'Webhook rejected', tags: [] },
        },
      });
    }
  );
});
