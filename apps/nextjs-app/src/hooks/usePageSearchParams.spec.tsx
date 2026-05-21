import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { usePageSearchParams } from './usePageSearchParams';

const useRouterMock = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => useRouterMock(),
}));

describe('usePageSearchParams', () => {
  it('parses query params from router asPath', () => {
    useRouterMock.mockReturnValue({
      asPath: '/base/base-1/design?tableId=tbl-1&theme=dark&theme=light',
    });

    const { result } = renderHook(() => usePageSearchParams());

    expect(result.current.get('tableId')).toBe('tbl-1');
    expect(result.current.get('theme')).toBe('dark');
    expect(result.current.getAll('theme')).toEqual(['dark', 'light']);
  });

  it('returns empty params when asPath has no query string', () => {
    useRouterMock.mockReturnValue({
      asPath: '/base/base-1/design',
    });

    const { result } = renderHook(() => usePageSearchParams());

    expect(Array.from(result.current.entries())).toEqual([]);
  });

  it('ignores hash fragments after the query string', () => {
    useRouterMock.mockReturnValue({
      asPath: '/base/base-1/design?tableId=tbl-1&theme=dark#section-2',
    });

    const { result } = renderHook(() => usePageSearchParams());

    expect(result.current.get('tableId')).toBe('tbl-1');
    expect(result.current.get('theme')).toBe('dark');
  });
});
