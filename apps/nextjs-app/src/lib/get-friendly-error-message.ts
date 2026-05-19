const streamErrorKeywords = [
  'stream_read_error',
  'stream read error',
  'upstream_error',
  'execution failed',
];

export const getFriendlyErrorMessage = (
  error: unknown,
  t: (key: string, options?: Record<string, string | number>) => string,
  fallbackKey = 'common:noun.unknownError'
): string => {
  if (!(error instanceof Error) || !error.message) {
    return t(fallbackKey);
  }

  const normalizedMessage = error.message.toLowerCase();

  if (streamErrorKeywords.some((keyword) => normalizedMessage.includes(keyword))) {
    return t('common:chat.responseInterrupted');
  }

  if (normalizedMessage === 'unknown error') {
    return t(fallbackKey);
  }

  return error.message;
};
