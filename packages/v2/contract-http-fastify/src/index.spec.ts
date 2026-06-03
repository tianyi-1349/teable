import fastify from 'fastify';
import { describe, expect, it } from 'vitest';
import { createV2FastifyPlugin } from './index';

const scheduleRun = {
  id: 'wfr123',
  workflowId: 'wfl123',
  snapshotId: 'wsn123',
  triggerType: 'schedule',
  status: 'completed',
  input: { source: 'workflowSchedule' },
  startedTime: '2026-05-31T00:00:00.000Z',
  finishedTime: '2026-05-31T00:00:01.000Z',
  durationMs: 1000,
  createdBy: 'usr123',
};

const webhookRun = {
  ...scheduleRun,
  id: 'wfr456',
  triggerType: 'webhook',
  input: { message: 'hello' },
};

const publicSetting = {
  instanceId: 'ins123',
  brandName: 'Teable',
  brandLogo: null,
  disallowSignUp: false,
  disallowSpaceCreation: false,
  disallowSpaceInvitation: false,
  disallowDashboard: false,
  enableEmailVerification: false,
  enableWaitlist: false,
  createdTime: '2026-05-31T00:00:00.000Z',
  aiConfig: null,
};

const shareView = {
  tableId: 'tbl123',
  shareId: 'shr123',
  fields: [],
  records: [],
};

describe('createV2FastifyPlugin', () => {
  it('routes workflow triggerSchedule through the fastify adapter', async () => {
    const app = fastify();
    await app.register(
      createV2FastifyPlugin({
        v1Adapter: {
          workflows: {
            triggerSchedule: async (input) => ({ ok: true, data: { run: scheduleRun, input } }),
          } as never,
        },
      })
    );
    await app.ready();

    const response = await app.inject({
      method: 'POST',
      url: '/workflows/triggerSchedule',
      payload: { baseId: 'bse123', workflowId: 'wfl123', body: { source: 'smoke' } },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      ok: true,
      data: {
        run: scheduleRun,
      },
    });

    await app.close();
  });

  it('routes workflow triggerWebhook through the fastify adapter', async () => {
    const app = fastify();
    await app.register(
      createV2FastifyPlugin({
        v1Adapter: {
          workflows: {
            triggerWebhook: async (input) => ({ ok: true, data: { run: webhookRun, input } }),
          } as never,
        },
      })
    );
    await app.ready();

    const response = await app.inject({
      method: 'POST',
      url: '/workflows/triggerWebhook',
      payload: {
        baseId: 'bse123',
        workflowId: 'wfl123',
        body: { message: 'hello' },
        webhookSecret: 'plain-secret',
        webhookSignature: 'sha256=abc',
        webhookTimestamp: '1770000000',
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      ok: true,
      data: {
        run: webhookRun,
      },
    });

    await app.close();
  });

  it('routes public setting through the fastify adapter', async () => {
    const app = fastify();
    await app.register(
      createV2FastifyPlugin({
        v1Adapter: {
          settings: {
            getPublic: async (input) => ({ ok: true, data: { setting: publicSetting, input } }),
          } as never,
        },
      })
    );
    await app.ready();

    const response = await app.inject({ method: 'GET', url: '/settings/getPublic' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, data: { setting: publicSetting } });

    await app.close();
  });

  it('routes published templates through the fastify adapter', async () => {
    const app = fastify();
    await app.register(
      createV2FastifyPlugin({
        v1Adapter: {
          templates: {
            listPublished: async (input) => ({ ok: true, data: { templates: [], input } }),
          } as never,
        },
      })
    );
    await app.ready();

    const response = await app.inject({
      method: 'GET',
      url: '/templates/listPublished?query[take]=10',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, data: { templates: [] } });

    await app.close();
  });

  it('routes share view through the fastify adapter', async () => {
    const app = fastify();
    await app.register(
      createV2FastifyPlugin({
        v1Adapter: {
          share: {
            getView: async (input) => ({ ok: true, data: { shareView, input } }),
          } as never,
        },
      })
    );
    await app.ready();

    const response = await app.inject({
      method: 'GET',
      url: '/share/getView?shareId=shr123',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ ok: true, data: { shareView } });

    await app.close();
  });
});
