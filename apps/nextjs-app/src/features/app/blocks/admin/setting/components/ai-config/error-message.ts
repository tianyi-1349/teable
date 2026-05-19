import { getFriendlyErrorMessage } from '@/lib/get-friendly-error-message';

export const getReadableAiConfigErrorMessage = (
  error: unknown,
  t: (key: string) => string,
  fallbackKey = 'admin.setting.ai.testFailed'
): string => getFriendlyErrorMessage(error, t, fallbackKey);
