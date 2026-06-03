const streamErrorKeywords = [
  'stream_read_error',
  'stream read error',
  'upstream_error',
  'execution failed',
];

const errorMessageKeys = ['message', 'code', 'type', 'error'] as const;

const getErrorMessageParts = (error: unknown, depth = 0): string[] => {
  if (depth > 4 || error == null) {
    return [];
  }

  if (error instanceof Error) {
    return [error.message, ...getErrorMessageParts(error.cause, depth + 1)].filter(Boolean);
  }

  if (typeof error === 'string') {
    const parts = [error];

    try {
      parts.push(...getErrorMessageParts(JSON.parse(error), depth + 1));
    } catch {
      // Keep the raw string when it is not JSON.
    }

    return parts;
  }

  if (typeof error !== 'object') {
    return [String(error)];
  }

  return errorMessageKeys.flatMap((key) =>
    getErrorMessageParts((error as Record<string, unknown>)[key], depth + 1)
  );
};

export const isStreamExecutionError = (error: unknown): boolean => {
  const normalizedMessage = getErrorMessageParts(error).join(' ').toLowerCase();

  return streamErrorKeywords.some((keyword) => normalizedMessage.includes(keyword));
};

export const getRawErrorMessage = (error: unknown): string | undefined => {
  const [message] = getErrorMessageParts(error).filter(Boolean);

  return message;
};

export const getFriendlyErrorMessage = (
  error: unknown,
  t: (key: string, options?: Record<string, string | number>) => string,
  fallbackKey = 'common:noun.unknownError'
): string => {
  const rawMessage = getRawErrorMessage(error);

  if (!rawMessage) {
    return t(fallbackKey);
  }

  if (isStreamExecutionError(error)) {
    return t('common:chat.responseInterrupted');
  }

  if (rawMessage.toLowerCase() === 'unknown error') {
    return t(fallbackKey);
  }

  return rawMessage;
};
