import { HttpError } from '@teable/core';
import type { GetServerSidePropsContext } from 'next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getUserMeMock } = vi.hoisted(() => ({
  getUserMeMock: vi.fn(),
}));

vi.mock('@/backend/api/rest/get-user', () => ({
  getUserMe: getUserMeMock,
}));

vi.mock('@/features/auth/components/SocialAuth', () => ({
  providersAll: [],
}));

vi.mock('@/features/app/base-node', () => ({
  BaseNodePageSwitch: () => null,
  getResourcePageProps: vi.fn(),
  redirect: vi.fn((destination: string) => ({
    redirect: {
      destination,
      permanent: false,
    },
  })),
}));

vi.mock('@/features/app/layouts/BaseLayout', () => ({
  BaseLayout: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/lib/handleBase', () => ({
  default: vi.fn(),
}));

vi.mock('@/lib/withAuthSSR', () => ({
  default: <T extends (...args: never[]) => unknown>(handler: T) =>
    (async (context: unknown) => handler(context as never, {} as never)) as unknown as T,
}));

vi.mock('@/lib/withEnv', () => ({
  default: <T extends (...args: never[]) => unknown>(handler: T) => handler,
}));

import { getServerSideProps } from '@/pages/base/[baseId]/[[...slug]]';

const createContext = (url: string) =>
  ({
    query: {
      baseId: 'base-1',
    },
    req: {
      headers: {},
      url,
    },
    res: {},
    resolvedUrl: url,
  }) as unknown as GetServerSidePropsContext;

describe('authenticated base page SSR entry', () => {
  beforeEach(() => {
    getUserMeMock.mockReset();
  });

  it('redirects unauthenticated requests to login with the current route', async () => {
    getUserMeMock.mockRejectedValue(new HttpError('Unauthorized', 401));

    const result = await getServerSideProps(createContext('/base/base-1/table/tbl-1'));

    expect(result).toEqual({
      redirect: {
        destination: '/auth/login?redirect=%2Fbase%2Fbase-1%2Ftable%2Ftbl-1',
        permanent: false,
      },
    });
  });
});
