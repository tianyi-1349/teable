import { BaseNodeResourceType } from '@teable/openapi';
import { render, screen } from '@/test-utils';
import { FormViewBase } from './FormViewBase';

const useTableIdMock = vi.fn();
const useViewIdMock = vi.fn();
const useIsMobileMock = vi.fn();
const useTablePermissionMock = vi.fn();
const useOptionalPublishedAppMock = vi.fn();
const useMutationMock = vi.fn();
const useFormModeStoreMock = vi.fn();
const formPreviewerMock = vi.fn();

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMutation: () => useMutationMock(),
  };
});

vi.mock('@teable/sdk/hooks', () => ({
  useTableId: () => useTableIdMock(),
  useViewId: () => useViewIdMock(),
  useIsMobile: () => useIsMobileMock(),
  useTablePermission: () => useTablePermissionMock(),
}));

vi.mock('@/features/app/published-app', () => ({
  useOptionalPublishedApp: () => useOptionalPublishedAppMock(),
}));

vi.mock('../tool-bar/store', () => ({
  FormMode: {
    Edit: 'edit',
  },
  useFormModeStore: () => useFormModeStoreMock(),
}));

vi.mock('./components', () => ({
  FormEditor: () => <div>form-editor</div>,
  FormPreviewer: (props: { submit?: (fields: Record<string, unknown>) => Promise<void> }) => {
    formPreviewerMock(props);
    return <div>{props.submit ? 'preview-submit-enabled' : 'preview-submit-disabled'}</div>;
  },
}));

describe('FormViewBase', () => {
  beforeEach(() => {
    useTableIdMock.mockReturnValue('table-1');
    useViewIdMock.mockReturnValue('view-1');
    useIsMobileMock.mockReturnValue(false);
    useTablePermissionMock.mockReturnValue({ 'view|update': false });
    useOptionalPublishedAppMock.mockReturnValue({
      isReadonly: false,
      currentNode: { resourceType: BaseNodeResourceType.Table },
    });
    useMutationMock.mockReturnValue({ mutateAsync: vi.fn() });
    useFormModeStoreMock.mockReturnValue({ modeMap: {} });
    formPreviewerMock.mockReset();
  });

  it('passes a submit handler when published runtime is editable', () => {
    render(<FormViewBase />);

    expect(screen.getByText('preview-submit-enabled')).toBeInTheDocument();
    expect(formPreviewerMock).toHaveBeenCalledTimes(1);
    expect(formPreviewerMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({ submit: expect.any(Function) })
    );
  });

  it('suppresses submission when published runtime is read-only', () => {
    useOptionalPublishedAppMock.mockReturnValue({
      isReadonly: true,
      currentNode: { resourceType: BaseNodeResourceType.Table },
    });

    render(<FormViewBase />);

    expect(screen.getByText('preview-submit-disabled')).toBeInTheDocument();
    expect(formPreviewerMock).toHaveBeenCalledTimes(1);
    expect(formPreviewerMock.mock.calls[0][0]).toEqual(
      expect.objectContaining({ submit: undefined })
    );
  });
});
