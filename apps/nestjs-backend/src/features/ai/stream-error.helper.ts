import type { Response } from 'express';

export interface IAiStreamError {
  code: string;
  message: string;
}

export function createAiStreamError(code: string, message: string): IAiStreamError {
  return { code, message };
}

export function getAiStreamErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function handleAiStreamErrorResponse(
  response: Response,
  streamError: IAiStreamError,
  write?: (streamError: IAiStreamError) => void
) {
  if (write) {
    write(streamError);
    return;
  }

  if (!response.headersSent) {
    response.status(500);
    response.setHeader('Content-Type', 'application/json');
  }
  response.end(JSON.stringify(streamError));
}
