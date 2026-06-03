import { HttpError } from '@teable/core';
import type { GetServerSidePropsContext } from 'next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createShareBaseSSR } from './share-base-ssr';

const createContext = () => {
  const setHeader = vi.fn();

  return {
    query: {
      shareId: 'share-1',
      baseId: 'base-1',
      slug: ['table', 'tbl-1'],
    },
    req: {
      headers: {
        cookie: 'sid=test',
      },
    },
    res: {
      setHeader,
    },
  } as unknown as GetServerSidePropsContext;
};

describe('createShareBaseSSR', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects 401 share access to the share auth entry', async () => {
    const ssrApi = {
      axios: { defaults: { headers: {} as Record<string, string> } },
      getBaseShare: vi.fn().mockRejectedValue(new HttpError('Unauthorized', 401)),
      configureShareHeaders: vi.fn(),
      getBaseById: vi.fn(),
      getBasePermission: vi.fn(),
    } as never;

    const result = await createShareBaseSSR({
      ssrApi,
      context: createContext(),
      getResourcePageProps: vi.fn(),
    });

    expect(result).toEqual({
      redirect: {
        destination: '/share/share-1/base/auth',
        permanent: false,
      },
    });
  });

  it('rewrites base redirects into share-prefixed routes', async () => {
    const getResourcePageProps = vi.fn().mockResolvedValue({
      redirect: {
        destination: '/base/base-1/table/tbl-1',
        permanent: false,
      },
    });

    const ssrApi = {
      axios: { defaults: { headers: {} as Record<string, string> } },
      getBaseShare: vi.fn().mockResolvedValue({
        baseId: 'base-1',
        defaultUrl: '/base/base-1/table/tbl-1',
        shareMeta: {
          nodeId: 'table-node',
          allowSave: false,
          allowCopy: true,
          allowEdit: false,
        },
      }),
      configureShareHeaders: vi.fn(),
      getBaseById: vi.fn().mockResolvedValue({ id: 'base-1' }),
      getBasePermission: vi.fn().mockResolvedValue({ role: 'viewer' }),
    } as never;

    const result = await createShareBaseSSR({
      ssrApi,
      context: createContext(),
      getResourcePageProps,
    });

    expect(result).toEqual({
      redirect: {
        destination: '/share/share-1/base/base-1/table/tbl-1',
        permanent: false,
      },
    });
  });
});
