import { ErrorPage } from '@/features/system/pages';
import { render, screen } from '@/test-utils';

describe('errorPage test', () => {
  it('should contain error passed status code', async () => {
    render(<ErrorPage statusCode={500} />);
    expect(screen.getByTestId('error-status-code')).toHaveTextContent('500');
  });

  it('renders a friendly message for stream execution failures', () => {
    render(
      <ErrorPage
        statusCode={500}
        error={
          new Error(
            '[EXECUTION_FAILED] task execution failed {"type":"error","sequence_number":0,"error":{"type":"upstream_error","code":"stream_read_error","message":"stream_read_error"}}'
          )
        }
      />
    );

    expect(screen.getByText('common:chat.responseInterrupted')).toBeInTheDocument();
    expect(screen.queryByText(/stream_read_error/)).not.toBeInTheDocument();
  });
});
