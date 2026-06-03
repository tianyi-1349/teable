import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  incrementTemplateVisitMock,
  addQueryParamsToWebSocketUrlMock,
  getWsPathMock,
  initAxiosMock,
  publishedAppProviderMock,
} = vi.hoisted(() => ({
  incrementTemplateVisitMock: vi.fn(),
  addQueryParamsToWebSocketUrlMock: vi.fn(() => 'ws://template'),
  getWsPathMock: vi.fn(() => 'ws://base'),
  initAxiosMock: vi.fn(),
  publishedAppProviderMock: vi.fn(),
}));

vi.mock('@teable/openapi', () => ({
  incrementTemplateVisit: incrementTemplateVisitMock,
}));

vi.mock('@teable/sdk', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  addQueryParamsToWebSocketUrl: addQueryParamsToWebSocketUrlMock,
}));

vi.mock('@teable/sdk/context', () => ({
  AnchorContext: {
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  BaseProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TableProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@teable/sdk/context/app/useConnection', () => ({
  getWsPath: getWsPathMock,
}));

vi.mock('next-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'en',
    },
  }),
}));

vi.mock('@/features/app/layouts', () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../blocks/base/base-node/BaseNodeProvider', () => ({
  BaseNodeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../blocks/base/base-side-bar/BaseSideBar', () => ({
  BaseSideBar: () => <div>base-sidebar</div>,
}));

vi.mock('../blocks/base/base-side-bar/BaseSidebarHeaderLeft', () => ({
  BaseSidebarHeaderLeft: () => <div>base-sidebar-header</div>,
}));

vi.mock('../blocks/base/BasePermissionListener', () => ({
  BasePermissionListener: () => null,
}));

vi.mock('../components/sidebar/Sidebar', () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../components/SideBarFooter', () => ({
  SideBarFooter: () => <div>sidebar-footer</div>,
}));

vi.mock('../hooks/useBaseResource', () => ({
  useBaseResource: () => ({
    baseId: 'base-1',
    tableId: 'table-1',
    viewId: 'view-1',
  }),
}));

vi.mock('../hooks/useEnv', () => ({
  useEnv: () => ({
    maxSearchFieldCount: 10,
  }),
}));

vi.mock('../hooks/useSdkLocale', () => ({
  useSdkLocale: () => 'en-US',
}));

vi.mock('../published-app', () => ({
  PublishedAppProvider: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    mode?: string;
    allowSave?: boolean;
    allowCopy?: boolean;
    allowEdit?: boolean;
  }) => {
    publishedAppProviderMock(props);
    return <>{children}</>;
  },
  PublishedAppRuntime: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="template-published-runtime">{children}</div>
  ),
}));

vi.mock('../utils/init-axios', () => ({
  initAxios: initAxiosMock,
}));

import { TemplateBaseLayout } from './TemplateBaseLayout';

describe('TemplateBaseLayout', () => {
  beforeEach(() => {
    incrementTemplateVisitMock.mockReset();
    addQueryParamsToWebSocketUrlMock.mockClear();
    getWsPathMock.mockClear();
    initAxiosMock.mockClear();
    publishedAppProviderMock.mockReset();
  });

  it('tracks template visits and renders template content', async () => {
    render(
      <TemplateBaseLayout
        base={
          {
            id: 'base-1',
            template: {
              id: 'template-1',
              headers: 'template-header',
            },
          } as never
        }
        childrenContent={<div>template-content</div>}
      >
        <div>fallback-children</div>
      </TemplateBaseLayout>
    );

    expect(screen.getByText('template-content')).toBeInTheDocument();
    expect(screen.queryByText('fallback-children')).toBeNull();
    expect(screen.getByTestId('template-published-runtime')).toBeInTheDocument();
    expect(initAxiosMock).toHaveBeenCalled();
    expect(getWsPathMock).toHaveBeenCalled();
    expect(addQueryParamsToWebSocketUrlMock).toHaveBeenCalledWith('ws://base', {
      templateHeader: 'template-header',
    });
    expect(publishedAppProviderMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'template',
        allowSave: false,
        allowCopy: false,
        allowEdit: false,
      })
    );

    await waitFor(() => {
      expect(incrementTemplateVisitMock).toHaveBeenCalledWith('template-1');
    });
  });

  it('returns children directly when base is not a template', () => {
    render(
      <TemplateBaseLayout
        base={{ id: 'base-1' } as never}
        childrenContent={<div>template-content</div>}
      >
        <div>fallback-children</div>
      </TemplateBaseLayout>
    );

    expect(screen.getByText('fallback-children')).toBeInTheDocument();
    expect(screen.queryByText('template-content')).toBeNull();
    expect(incrementTemplateVisitMock).not.toHaveBeenCalled();
  });
});
