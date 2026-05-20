import { describe, expect, it } from 'vitest';

import { RequestRouter } from './request-router';

describe('RequestRouter', () => {
  it('routes full capability to v2 executor', async () => {
    const router = new RequestRouter({
      capability: { workflows: { list: 'full' } },
    });

    const result = await router.route(
      'workflows',
      'list',
      async () => 'v2',
      async () => 'v1'
    )({});

    expect(result).toBe('v2');
  });

  it('routes partial capability to v2 executor when feature enabled', async () => {
    const router = new RequestRouter({
      capability: { workflows: { list: 'partial' } },
      featureFlags: { isEnabled: (flag) => flag === 'v2-workflows' },
    });

    const result = await router.route(
      'workflows',
      'list',
      async () => 'v2',
      async () => 'v1'
    )({});

    expect(result).toBe('v2');
  });

  it('routes partial capability to v1 executor when feature disabled', async () => {
    const router = new RequestRouter({
      capability: { workflows: { list: 'partial' } },
      featureFlags: { isEnabled: () => false },
    });

    const result = await router.route(
      'workflows',
      'list',
      async () => 'v2',
      async () => 'v1'
    )({});

    expect(result).toBe('v1');
  });

  it('falls back to v2 executor when v1 executor missing', async () => {
    const router = new RequestRouter({
      capability: { comments: { list: 'v1' } },
    });

    const result = await router.route('comments', 'list', async () => 'v2')({});

    expect(result).toBe('v2');
  });

  it('routes v1 capability to v1 executor', async () => {
    const router = new RequestRouter({
      capability: { organization: { getMe: 'v1' } },
    });

    const result = await router.route(
      'organization',
      'getMe',
      async () => 'v2',
      async () => 'v1'
    )({});

    expect(result).toBe('v1');
  });
});
