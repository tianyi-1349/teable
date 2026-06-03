import { getFriendlyErrorMessage, isStreamExecutionError } from './get-friendly-error-message';

const t = (key: string) => key;

describe('getFriendlyErrorMessage', () => {
  it('normalizes nested stream execution error objects', () => {
    const error = {
      type: 'error',
      sequence_number: 0,
      error: {
        type: 'upstream_error',
        code: 'stream_read_error',
        message: 'stream_read_error',
      },
    };

    expect(isStreamExecutionError(error)).toBe(true);
    expect(getFriendlyErrorMessage(error, t)).toBe('common:chat.responseInterrupted');
  });

  it('normalizes JSON string stream execution errors', () => {
    const error = new Error(
      '[EXECUTION_FAILED] task execution failed {"type":"error","sequence_number":0,"error":{"type":"upstream_error","code":"stream_read_error","message":"stream_read_error"}}'
    );

    expect(getFriendlyErrorMessage(error, t)).toBe('common:chat.responseInterrupted');
  });

  it('returns the raw message for regular errors', () => {
    expect(getFriendlyErrorMessage(new Error('regular failure'), t)).toBe('regular failure');
  });
});
