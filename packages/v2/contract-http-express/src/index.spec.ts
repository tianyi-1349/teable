import { once } from 'events';
import { createServer, type Server } from 'http';
import express from 'express';
import { afterEach, describe, expect, it } from 'vitest';
import { createV2ExpressRouter } from './index';

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

let server: Server | undefined;

const listen = async (app: express.Express) => {
  server = createServer(app);
  server.listen(0);
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Invalid test server address');
  }
  return `http://127.0.0.1:${address.port}`;
};

describe('createV2ExpressRouter', () => {
  afterEach(async () => {
    if (!server) {
      return;
    }
    const current = server;
    server = undefined;
    current.close();
    await once(current, 'close');
  });

  it('routes representative v2 contract requests through the express adapter', async () => {
    const app = express();
    app.use(express.json());
    app.use(
      createV2ExpressRouter({
        v1Adapter: {
          settings: {
            getPublic: async (input) => ({ ok: true, data: { setting: publicSetting, input } }),
          } as never,
          templates: {
            listPublished: async (input) => ({ ok: true, data: { templates: [], input } }),
          } as never,
          share: {
            getView: async (input) => ({ ok: true, data: { shareView, input } }),
          } as never,
        },
      })
    );
    const baseUrl = await listen(app);

    await expect(fetch(`${baseUrl}/settings/getPublic`).then((res) => res.json())).resolves.toEqual(
      {
        ok: true,
        data: { setting: publicSetting },
      }
    );
    await expect(
      fetch(`${baseUrl}/templates/listPublished?query[take]=10`).then((res) => res.json())
    ).resolves.toEqual({ ok: true, data: { templates: [] } });
    await expect(
      fetch(`${baseUrl}/share/getView?shareId=shr123`).then((res) => res.json())
    ).resolves.toEqual({ ok: true, data: { shareView } });
  });
});
