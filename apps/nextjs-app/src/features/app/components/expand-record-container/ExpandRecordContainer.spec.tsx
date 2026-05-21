import { render } from '@/test-utils';
import { ExpandRecordContainer } from './ExpandRecordContainer';

const pushMock = vi.fn();
const expandRecorderPropsMock = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/base/[baseId]/[[...slug]]',
    query: {
      baseId: 'base-1',
      recordId: 'rec-1',
      fromNotify: '1',
      commentId: 'comment-1',
      showHistory: 'true',
      showComment: 'true',
      keep: 'value',
    },
    push: pushMock,
  }),
}));

vi.mock('@teable/sdk/hooks', () => ({
  useTableId: () => 'tbl-1',
  useViewId: () => 'viw-1',
}));

vi.mock('../download-attachments', () => ({
  useDownloadAttachmentsStore: (
    selector: (state: { triggerCellDownload: () => void }) => unknown
  ) => selector({ triggerCellDownload: vi.fn() }),
}));

vi.mock('./ExpandRecordContainerBase', () => ({
  ExpandRecordContainerBase: (props: {
    onClose?: () => void;
    onUpdateRecordIdCallback?: (recordId: string) => void;
  }) => {
    expandRecorderPropsMock(props);
    return <div>expand-record-container-base</div>;
  },
}));

describe('ExpandRecordContainer', () => {
  beforeEach(() => {
    pushMock.mockReset();
    expandRecorderPropsMock.mockReset();
  });

  it('clears record-specific query params when record detail closes', () => {
    render(<ExpandRecordContainer />);

    const props = expandRecorderPropsMock.mock.calls[0][0];
    props.onClose?.();

    expect(pushMock).toHaveBeenCalledWith(
      {
        pathname: '/base/[baseId]/[[...slug]]',
        query: {
          baseId: 'base-1',
          keep: 'value',
        },
      },
      undefined,
      {
        shallow: true,
      }
    );
  });

  it('updates the route recordId when record detail changes', () => {
    render(<ExpandRecordContainer />);

    const props = expandRecorderPropsMock.mock.calls[0][0];
    props.onUpdateRecordIdCallback?.('rec-2');

    expect(pushMock).toHaveBeenCalledWith(
      {
        pathname: '/base/[baseId]/[[...slug]]',
        query: {
          baseId: 'base-1',
          recordId: 'rec-2',
          fromNotify: '1',
          commentId: 'comment-1',
          showHistory: 'true',
          showComment: 'true',
          keep: 'value',
        },
      },
      undefined,
      {
        shallow: true,
      }
    );
  });
});
