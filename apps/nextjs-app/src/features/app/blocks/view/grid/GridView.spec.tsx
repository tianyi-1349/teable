import { render, screen } from '@/test-utils';
import { GridView } from './GridView';

const useOptionalPublishedAppMock = vi.fn();
const useIsMobileMock = vi.fn();
const usePersonalViewMock = vi.fn();

vi.mock('@teable/sdk/context', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    AggregationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    RecordProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    RowCountProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TaskStatusCollectionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('@teable/sdk/context/query', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    SearchProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

vi.mock('@/features/app/published-app', () => ({
  useOptionalPublishedApp: () => useOptionalPublishedAppMock(),
}));

vi.mock('@teable/sdk/hooks', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useIsMobile: () => useIsMobileMock(),
    usePersonalView: () => usePersonalViewMock(),
  };
});

vi.mock('./GridViewBase', () => ({
  GridViewBase: () => <div>grid-base</div>,
}));

vi.mock('../tool-bar/GridToolBar', () => ({
  GridToolBar: () => <div>grid-toolbar</div>,
}));

describe('GridView', () => {
  beforeEach(() => {
    useOptionalPublishedAppMock.mockReset();
    useIsMobileMock.mockReset();
    usePersonalViewMock.mockReset();

    usePersonalViewMock.mockReturnValue({
      personalViewCommonQuery: {},
      personalViewAggregationQuery: {},
    });
  });

  it('shows mobile published guidance for compact browsing and record details', () => {
    useOptionalPublishedAppMock.mockReturnValue({ isReadonly: true });
    useIsMobileMock.mockReturnValue(true);

    render(
      <GridView
        recordServerData={undefined}
        recordsServerData={{ records: [] }}
        groupPointsServerDataMap={{}}
      />
    );

    expect(
      screen.getByText(
        'Tap a row to open record details. Search and filter actions stay available in the compact toolbar.'
      )
    ).toBeInTheDocument();
  });

  it('keeps the base layout styling outside published mobile runtime', () => {
    useOptionalPublishedAppMock.mockReturnValue(undefined);
    useIsMobileMock.mockReturnValue(false);

    const { container } = render(
      <GridView
        recordServerData={undefined}
        recordsServerData={{ records: [] }}
        groupPointsServerDataMap={{}}
      />
    );

    expect(
      screen.getByText(
        'Tap a row to open record details. Search and filter actions stay available in the compact toolbar.'
      )
    ).toBeInTheDocument();
    expect(container.querySelector('.bg-muted/10')).toBeNull();
  });
});
