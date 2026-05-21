import { fireEvent, render, screen, waitFor } from '@/test-utils';
import { PublishBaseDialog } from './PublishBaseDialog';

const publishBaseMock = vi.fn();
const getTemplateByBaseIdMock = vi.fn();
const useBaseMock = vi.fn();
const useBaseNodeContextMock = vi.fn();
const useAppPublishContextMock = vi.fn();
const validatePublishedAppConfigMock = vi.fn();

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

vi.mock('@teable/openapi', async () => {
  const actual = await vi.importActual<object>('@teable/openapi');
  return {
    ...actual,
    getTemplateByBaseId: (...args: unknown[]) => getTemplateByBaseIdMock(...args),
    publishBase: (...args: unknown[]) => publishBaseMock(...args),
    unpublishTemplate: vi.fn(),
  };
});

vi.mock('@teable/sdk/hooks', () => ({
  useBase: () => useBaseMock(),
}));

vi.mock('@/features/app/hooks/useIsCloud', () => ({
  useIsCloud: () => false,
}));

vi.mock('../../../base/base-node/hooks/useBaseNodeContext', () => ({
  useBaseNodeContext: () => useBaseNodeContextMock(),
}));

vi.mock('./AppPublishContext', () => ({
  useAppPublishContext: () => useAppPublishContextMock(),
}));

vi.mock('@/features/app/published-app', async () => {
  const actual = await vi.importActual<object>('@/features/app/published-app');
  return {
    ...actual,
    PublishedAppDevicePreview: () => <div>published-device-preview</div>,
    validatePublishedAppConfig: (...args: unknown[]) => validatePublishedAppConfigMock(...args),
  };
});

vi.mock('./NodeTreeSelect', () => ({
  NodeTreeSelect: () => <div>node-tree-select</div>,
}));

vi.mock('./NodeSelect', () => ({
  NodeSelect: () => <div>node-select</div>,
}));

vi.mock('./UnpublishedAppsDialog', () => ({
  UnpublishedAppsDialog: () => null,
  getUnpublishedAppNodes: () => [],
}));

describe('PublishBaseDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    getTemplateByBaseIdMock.mockResolvedValue({ data: null });
    publishBaseMock.mockResolvedValue({
      data: {
        baseId: 'snapshot-base-1',
        defaultUrl: '/base/snapshot-base-1',
        permalink: '/t/template-1',
      },
    });
    useBaseMock.mockReturnValue({
      id: 'base-1',
      name: 'Revenue Base',
    });
    useBaseNodeContextMock.mockReturnValue({
      treeItems: {
        root: { id: 'root' },
        'node-1': {
          id: 'node-1',
          resourceId: 'tbl-1',
          resourceType: 'table',
          resourceMeta: { name: 'Pipeline' },
        },
      },
    });
    useAppPublishContextMock.mockReturnValue({
      publishApp: vi.fn(),
    });
    validatePublishedAppConfigMock.mockReturnValue({
      hasErrors: false,
      issues: [],
    });
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...window.location,
        origin: 'https://example.test',
      },
    });
  });

  it('opens the success dialog with the published permalink after a successful publish', async () => {
    render(
      <PublishBaseDialog onClose={vi.fn()}>
        <button type="button">open publish</button>
      </PublishBaseDialog>
    );

    fireEvent.click(screen.getByRole('button', { name: 'open publish' }));

    fireEvent.change(screen.getByPlaceholderText('publishBase.form.descriptionPlaceholder'), {
      target: { value: 'Shared revenue app' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'publishBase.publish' }));

    await waitFor(() => {
      expect(publishBaseMock).toHaveBeenCalledWith(
        'base-1',
        expect.objectContaining({
          title: 'Revenue Base',
          description: 'Shared revenue app',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText('publishBase.publishSuccess')).toBeInTheDocument();
    });

    expect(screen.getByText('https://example.test/t/template-1')).toBeInTheDocument();
  });
});
