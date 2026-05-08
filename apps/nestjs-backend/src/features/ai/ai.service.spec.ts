import { describe, expect, it } from 'vitest';
import { AiService } from './ai.service';

describe('AiService', () => {
  const service = new AiService(null as never, null as never, null as never, null as never);

  it('normalizes upstream stream read errors into a stable message', () => {
    const message = (service as never).normalizeAiStreamErrorMessage(
      '[EXECUTION_FAILED] task execution failed: {"type":"error","sequence_number":0,"error":{"type":"upstream_error","code":"stream_read_error","message":"stream_read_error"}}'
    );

    expect(message).toBe(
      'AI generation failed while reading the provider stream. Please retry or verify the configured model provider.'
    );
  });

  it('preserves specific non-stream provider errors', () => {
    const message = (service as never).normalizeAiStreamErrorMessage('Model key is not set');

    expect(message).toBe('Model key is not set');
  });
});
