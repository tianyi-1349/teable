import type { GetServerSidePropsContext } from 'next';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getTemplatePermalinkMock = vi.fn();

vi.mock('@/backend/api/rest/ssr-api', () => ({
  SsrApi: class {
    getTemplatePermalink = getTemplatePermalinkMock;
  },
}));

vi.mock('@/lib/withEnv', () => ({
  default: <T extends (...args: never[]) => unknown>(handler: T) => handler,
}));

import { getServerSideProps } from './[identifier]';

const createContext = (query: Record<string, string> = {}) =>
  ({
    query,
    req: {} as GetServerSidePropsContext['req'],
    res: {} as GetServerSidePropsContext['res'],
    resolvedUrl: '',
  }) as GetServerSidePropsContext;

describe('template permalink page', () => {
  beforeEach(() => {
    getTemplatePermalinkMock.mockReset();
  });

  it('redirects to the resolved template destination', async () => {
    getTemplatePermalinkMock.mockResolvedValue({
      redirectUrl: '/base/base-1/table/tbl-1',
    });

    const result = await getServerSideProps(createContext({ identifier: 'template-1' }));

    expect(getTemplatePermalinkMock).toHaveBeenCalledWith('template-1');
    expect(result).toEqual({
      redirect: {
        destination: '/base/base-1/table/tbl-1',
        permanent: false,
      },
    });
  });

  it('returns notFound when identifier is missing', async () => {
    const result = await getServerSideProps(createContext());

    expect(getTemplatePermalinkMock).not.toHaveBeenCalled();
    expect(result).toEqual({
      notFound: true,
    });
  });
});
