import { render, screen, userEvent } from '@/test-utils';
import { PasteSelectionProgressDialog } from './PasteSelectionProgressDialog';

describe('PasteSelectionProgressDialog', () => {
  it('renders a safe zero-progress state without error details', () => {
    render(
      <PasteSelectionProgressDialog
        open
        mode="progress"
        progress={null}
        summary={null}
        errors={[]}
        status="running"
        onOpenChange={() => undefined}
      />
    );

    expect(screen.getByText('table:table.actionTips.pasting')).toBeInTheDocument();
    expect(screen.getByText('table:table.actionTips.pasteStream.pasting')).toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
    expect(
      screen.queryByText('table:table.actionTips.pasteStream.chunkFailureTitle')
    ).not.toBeInTheDocument();
  });

  it('reveals chunk failure details when the collapsible is expanded', async () => {
    render(
      <PasteSelectionProgressDialog
        open
        mode="progress"
        progress={{
          id: 'progress',
          phase: 'pasting',
          batchIndex: 1,
          totalCount: 3,
          processedCount: 2,
          updatedCount: 1,
          createdCount: 1,
          batchProcessedCount: 1,
        }}
        summary={{
          id: 'done',
          totalCount: 3,
          processedCount: 2,
          updatedCount: 1,
          createdCount: 1,
          data: {
            updatedCount: 1,
            createdCount: 1,
            createdRecordIds: ['rec2'],
          },
        }}
        errors={[
          {
            id: 'error',
            phase: 'pasting',
            batchIndex: 1,
            totalCount: 3,
            processedCount: 2,
            updatedCount: 1,
            createdCount: 1,
            recordIds: ['rec3'],
            message: 'paste failed',
          },
        ]}
        status="partial"
      />
    );

    expect(
      screen.getByText('table:table.actionTips.pasteStream.completedWithIssues')
    ).toBeInTheDocument();

    const trigger = screen
      .getByText('table:table.actionTips.pasteStream.chunkFailureTitle')
      .closest('button');

    expect(trigger).not.toBeNull();
    expect(screen.queryByText('paste failed')).not.toBeInTheDocument();

    await userEvent.click(trigger!);

    expect(screen.getByText('paste failed')).toBeVisible();
    expect(screen.getByText('rec3')).toBeVisible();
  });

  it('renders a confirmation state and triggers paste on confirm', async () => {
    const onConfirm = vi.fn();

    render(
      <PasteSelectionProgressDialog
        open
        mode="confirm"
        progress={null}
        summary={null}
        errors={[]}
        status={null}
        confirmRecordCount={1200}
        onConfirm={onConfirm}
        onOpenChange={() => undefined}
      />
    );

    expect(screen.getByText('table:table.actionTips.pasteConfirmTitle')).toBeInTheDocument();
    expect(screen.getByText('table:table.actionTips.pasteConfirmDescription')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'table:table.actionTips.paste' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
