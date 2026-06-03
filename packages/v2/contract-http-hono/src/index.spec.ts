import { describe, expect, it } from 'vitest';
import { createV2HonoApp } from './index';

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

describe('createV2HonoApp', () => {
  it('routes representative v2 contract requests through the hono adapter', async () => {
    const app = createV2HonoApp({
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
    });

    await expect(app.request('/settings/getPublic').then((res) => res.json())).resolves.toEqual({
      ok: true,
      data: { setting: publicSetting },
    });
    await expect(
      app.request('/templates/listPublished?query[take]=10').then((res) => res.json())
    ).resolves.toEqual({ ok: true, data: { templates: [] } });
    await expect(
      app.request('/share/getView?shareId=shr123').then((res) => res.json())
    ).resolves.toEqual({ ok: true, data: { shareView } });
  });
});
