import { render, screen } from '@/test-utils';
import { TableResourcePage } from './TableResourcePage';

const usePublishedAppMock = vi.fn();

vi.mock('../../context', () => ({
  usePublishedApp: () => usePublishedAppMock(),
}));

describe('TableResourcePage', () => {
  beforeEach(() => {
    usePublishedAppMock.mockReset();
  });

  it('shows read-only published guidance when editing is disabled', () => {
    usePublishedAppMock.mockReturnValue({
      manifest: {
        permissions: {
          allowEdit: false,
          allowCopy: false,
          allowSave: false,
          readonly: true,
        },
      },
      isMobile: false,
    });

    render(
      <TableResourcePage>
        <div>table-runtime</div>
      </TableResourcePage>
    );

    expect(screen.getByText('system.publishedApp.publishedViewTitle')).toBeInTheDocument();
    expect(screen.getByText('system.publishedApp.publishedViewDescription')).toBeInTheDocument();
    expect(screen.getByText('system.publishedApp.tableDesktopGuidance')).toBeInTheDocument();
    expect(screen.getByText('system.publishedApp.tableReadonly')).toBeInTheDocument();
    expect(screen.getByText('system.publishedApp.tableDenyCopy')).toBeInTheDocument();
    expect(screen.getByText('system.publishedApp.tableDenySave')).toBeInTheDocument();
    expect(screen.getByText('system.publishedApp.readOnly')).toBeInTheDocument();
  });

  it('shows compact mobile and enabled permission guidance when share permissions allow it', () => {
    usePublishedAppMock.mockReturnValue({
      manifest: {
        permissions: {
          allowEdit: true,
          allowCopy: true,
          allowSave: true,
          readonly: false,
        },
      },
      isMobile: true,
    });

    render(
      <TableResourcePage>
        <div>table-runtime</div>
      </TableResourcePage>
    );

    expect(screen.getByText('system.publishedApp.tableMobileGuidance')).toBeInTheDocument();
    expect(screen.getByText('system.publishedApp.tableAllowEdit')).toBeInTheDocument();
    expect(screen.getByText('system.publishedApp.tableAllowCopy')).toBeInTheDocument();
    expect(screen.getByText('system.publishedApp.tableAllowSave')).toBeInTheDocument();
    expect(
      screen.getByText(
        'system.publishedApp.interactive • system.publishedApp.copyEnabled • system.publishedApp.saveEnabled'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('system.publishedApp.mobileHint')).toBeInTheDocument();
  });
});
