import type * as ShadcnModule from '@teable/ui-lib/shadcn';
import { fireEvent, render, screen, userEvent, waitFor } from '@/test-utils';
import { AppModeConfigEditorCard } from './AppModeConfigEditorCard';

const mockEditor = {
  config: {
    version: 1,
    pages: [{ id: 'p1', name: 'Home', type: 'list' as const }],
    linkedBaseIds: ['baseA'],
    dashboardIds: ['dashA'],
    workflowEnabled: false,
    governance: {
      roleMatrixVersion: 1,
      auditPolicy: 'standard' as const,
      permissionMode: 'inherited' as const,
    },
  },
  draft: {
    version: 1,
    pages: [{ id: 'p1', name: 'Home', type: 'list' as const }],
    linkedBaseIds: ['baseA'],
    dashboardIds: ['dashA'],
    workflowEnabled: false,
    governance: {
      roleMatrixVersion: 1,
      auditPolicy: 'standard' as const,
      permissionMode: 'inherited' as const,
    },
  },
  isDirty: true,
  draftValidation: { ok: true as const },
  isUpdating: false,
  isLoading: false,
  error: null as Error | null,
  setWorkflowEnabled: vi.fn(),
  setLinkedBaseIds: vi.fn(),
  setDashboardIds: vi.fn(),
  setGovernance: vi.fn(),
  addPage: vi.fn(),
  updatePageByIndex: vi.fn(),
  removePageByIndex: vi.fn(),
  movePageByIndex: vi.fn(),
  updatePage: vi.fn(),
  removePage: vi.fn(),
  patchDraft: vi.fn(),
  saveDraft: vi.fn(),
  resetDraft: vi.fn(),
  refetch: vi.fn(),
};

const toast = vi.fn();

vi.mock('@teable/sdk/hooks', () => ({
  useAppModeConfigEditor: () => mockEditor,
}));

vi.mock('@teable/ui-lib/shadcn', async (importOriginal) => {
  const actual = await importOriginal<typeof ShadcnModule>();
  return {
    ...actual,
    useToast: () => ({ toast }),
  };
});

describe('AppModeConfigEditorCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEditor.isLoading = false;
    mockEditor.error = null;
    mockEditor.draft.pages = [{ id: 'p1', name: 'Home', type: 'list' }];
  });

  it('updates linked base ids on blur', async () => {
    render(<AppModeConfigEditorCard baseId="base123" />);

    const input = screen.getByPlaceholderText('baseA, baseB');
    await userEvent.clear(input);
    await userEvent.type(input, 'baseX, baseY');
    await userEvent.tab();

    expect(mockEditor.setLinkedBaseIds).toHaveBeenCalledWith(['baseX', 'baseY']);
  });

  it('adds page when id and name are provided', async () => {
    render(<AppModeConfigEditorCard baseId="base123" />);

    await userEvent.type(screen.getAllByPlaceholderText('Page id')[0], 'p2');
    await userEvent.type(screen.getAllByPlaceholderText('Page name')[0], 'Detail');
    await userEvent.click(screen.getByRole('button', { name: 'Add page' }));

    expect(mockEditor.addPage).toHaveBeenCalledWith({ id: 'p2', name: 'Detail', type: 'list' });
  });

  it('exports draft json into the input', async () => {
    render(<AppModeConfigEditorCard baseId="base123" />);

    const input = screen.getByPlaceholderText('Paste app mode config JSON') as HTMLInputElement;
    await userEvent.click(screen.getByRole('button', { name: 'Export draft JSON' }));

    await waitFor(() => {
      expect(input.value).toContain('"version": 1');
      expect(input.value).toContain('"workflowEnabled": false');
    });
  });

  it('shows error toast when import json is invalid', async () => {
    render(<AppModeConfigEditorCard baseId="base123" />);

    const input = screen.getByPlaceholderText('Paste app mode config JSON') as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.paste('{invalid');
    await userEvent.click(screen.getByRole('button', { name: 'Import JSON' }));

    expect(toast).toHaveBeenCalledWith({
      title: 'Invalid JSON',
      variant: 'destructive',
    });
  });

  it('shows error toast when import json does not match schema', async () => {
    render(<AppModeConfigEditorCard baseId="base123" />);

    const input = screen.getByPlaceholderText('Paste app mode config JSON') as HTMLInputElement;
    await userEvent.click(input);
    await userEvent.paste('{"pages":"invalid"}');
    await userEvent.click(screen.getByRole('button', { name: 'Import JSON' }));

    expect(mockEditor.patchDraft).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Invalid app mode config',
        variant: 'destructive',
      })
    );
  });

  it('blocks adding page with duplicate id', async () => {
    render(<AppModeConfigEditorCard baseId="base123" />);

    await userEvent.type(screen.getAllByPlaceholderText('Page id')[0], 'p1');
    await userEvent.type(screen.getAllByPlaceholderText('Page name')[0], 'Duplicate');
    await userEvent.click(screen.getByRole('button', { name: 'Add page' }));

    expect(mockEditor.addPage).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith({
      title: 'Duplicate page id',
      description: 'Please use a unique page id.',
      variant: 'destructive',
    });
  });

  it('updates governance by role matrix input', async () => {
    render(<AppModeConfigEditorCard baseId="base123" />);

    const input = screen.getByDisplayValue('1');
    await userEvent.clear(input);
    await userEvent.type(input, '3');

    expect(mockEditor.setGovernance).toHaveBeenCalled();
    const calls = mockEditor.setGovernance.mock.calls.map((call) => call[0]?.roleMatrixVersion);
    expect(calls.some((value) => typeof value === 'number' && value >= 3)).toBe(true);
  });

  it('moves page order when clicking up and down', async () => {
    mockEditor.draft.pages = [
      { id: 'p1', name: 'Home', type: 'list' },
      { id: 'p2', name: 'Detail', type: 'detail' },
    ] as typeof mockEditor.draft.pages;

    render(<AppModeConfigEditorCard baseId="base123" />);

    const downButtons = screen.getAllByRole('button', { name: 'Down' });
    await userEvent.click(downButtons[0]);
    expect(mockEditor.movePageByIndex).toHaveBeenCalledWith(0, 1);
  });

  it('updates page fields through index-based editor actions', async () => {
    render(<AppModeConfigEditorCard baseId="base123" />);

    const pageNameInput = screen.getByDisplayValue('Home');
    fireEvent.change(pageNameInput, { target: { value: 'Homepage' } });

    expect(mockEditor.updatePageByIndex).toHaveBeenCalled();
  });

  it('removes page through index-based editor actions', async () => {
    render(<AppModeConfigEditorCard baseId="base123" />);

    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));

    expect(mockEditor.removePageByIndex).toHaveBeenCalledWith(0);
  });

  it('shows load error instead of hiding the card', () => {
    mockEditor.error = new Error('Stored app mode config is invalid and cannot be loaded');

    render(<AppModeConfigEditorCard baseId="base123" />);

    expect(screen.getByText('Failed to load app mode config')).toBeInTheDocument();
    expect(screen.getByText('Stored app mode config is invalid and cannot be loaded')).toBeInTheDocument();
  });
});
