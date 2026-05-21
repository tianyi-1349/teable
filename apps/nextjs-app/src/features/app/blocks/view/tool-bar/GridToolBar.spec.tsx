import { render, screen } from '@/test-utils';
import { GridToolBar } from './GridToolBar';

const useTablePermissionMock = vi.fn();
const useIsReadOnlyPreviewMock = vi.fn();
const useIsMobileMock = vi.fn();
const useOptionalPublishedAppMock = vi.fn();
const useViewConfigurableMock = vi.fn();
const gridViewOperatorsMock = vi.fn();

vi.mock('@teable/sdk/hooks', () => ({
  useTablePermission: () => useTablePermissionMock(),
  useIsReadOnlyPreview: () => useIsReadOnlyPreviewMock(),
  useIsMobile: () => useIsMobileMock(),
}));

vi.mock('@/features/app/published-app', () => ({
  useOptionalPublishedApp: () => useOptionalPublishedAppMock(),
}));

vi.mock('./hook', () => ({
  useViewConfigurable: () => useViewConfigurableMock(),
}));

vi.mock('@teable/sdk/components', () => ({
  CreateRecordModal: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./components', () => ({
  GridViewOperators: (props: { disabled?: boolean; compact?: boolean }) => {
    gridViewOperatorsMock(props);
    return <div>{props.compact ? 'operators-compact' : 'operators-regular'}</div>;
  },
}));

vi.mock('./Others', () => ({
  Others: () => <div>others</div>,
}));

describe('GridToolBar', () => {
  beforeEach(() => {
    useTablePermissionMock.mockReturnValue({
      'record|create': true,
    });
    useIsReadOnlyPreviewMock.mockReturnValue(false);
    useIsMobileMock.mockReturnValue(false);
    useOptionalPublishedAppMock.mockReturnValue(undefined);
    useViewConfigurableMock.mockReturnValue({ isViewConfigurable: true });
    gridViewOperatorsMock.mockReset();
  });

  it('passes compact mode to operators in published mobile runtime', () => {
    useIsMobileMock.mockReturnValue(true);
    useOptionalPublishedAppMock.mockReturnValue({ isReadonly: false });

    render(<GridToolBar />);

    expect(screen.getByText('operators-compact')).toBeInTheDocument();
    expect(gridViewOperatorsMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({ compact: true, disabled: false })
    );
  });

  it('disables record creation in read-only published runtime', () => {
    useOptionalPublishedAppMock.mockReturnValue({ isReadonly: true });

    render(<GridToolBar />);

    expect(screen.getByRole('button', { name: 'table:view.addRecord' })).toBeDisabled();
    expect(screen.getByText('operators-regular')).toBeInTheDocument();
  });
});
