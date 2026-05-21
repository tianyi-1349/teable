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

    expect(screen.getByText('Published view')).toBeInTheDocument();
    expect(
      screen.getByText('Editing actions stay locked in read-only published runtime.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Copy actions stay suppressed by published permissions.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Save actions stay suppressed by published permissions.')
    ).toBeInTheDocument();
    expect(screen.getByText('Read-only')).toBeInTheDocument();
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

    expect(
      screen.getByText('Compact mobile browsing is active for published views.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Edits stay available in published runtime where the shared view allows them.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText('Copy actions remain available from the shared view runtime.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Save actions can surface when the shared view runtime exposes them.')
    ).toBeInTheDocument();
    expect(screen.getByText('Interactive • copy enabled • save enabled')).toBeInTheDocument();
    expect(
      screen.getByText('Mobile layout keeps published interactions compact and read-only safe.')
    ).toBeInTheDocument();
  });
});
