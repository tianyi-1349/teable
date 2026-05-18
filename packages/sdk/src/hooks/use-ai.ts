import { aiGenerateStream } from '@teable/openapi';
import { useCallback, useState, useRef } from 'react';
import { useTranslation } from '../context/app/i18n';
import type { ILocaleFunction } from '../context/app/i18n';
import { useBaseId } from './use-base-id';

const getFriendlyAiErrorMessage = (error: unknown, t: ILocaleFunction): string => {
  if (!(error instanceof Error) || !error.message) {
    return String(t('httpErrors.ai.generateFailed'));
  }

  const normalizedMessage = error.message.toLowerCase();

  if (
    normalizedMessage.includes('stream_read_error') ||
    normalizedMessage.includes('stream read error') ||
    normalizedMessage.includes('upstream_error') ||
    normalizedMessage.includes('execution failed')
  ) {
    return String(t('httpErrors.networkError'));
  }

  if (normalizedMessage.includes('abort')) {
    return String(t('httpErrors.ai.generateStopped'));
  }

  return error.message;
};

const getResponseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const errorPayload = (await response.json()) as { message?: string; code?: string };

    if (typeof errorPayload.message === 'string' && errorPayload.message) {
      return errorPayload.message;
    }

    if (typeof errorPayload.code === 'string' && errorPayload.code) {
      return errorPayload.code;
    }
  } catch {
    // Fall back to a generic message when the response body is not JSON.
  }

  return `HTTP error! status: ${response.status}`;
};

interface IUseAIStreamOptions {
  timeout?: number; // unit: ms
}

export const useAIStream = (options?: IUseAIStreamOptions) => {
  const { timeout = 30000 } = options || {};
  const { t } = useTranslation();
  const baseId = useBaseId();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const generateAIResponse = useCallback(
    async (prompt: string) => {
      setText('');
      setError(null);
      setLoading(true);

      controllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => controllerRef.current?.abort(), timeout);

      try {
        const result = await aiGenerateStream(baseId!, { prompt }, controllerRef.current.signal);

        if (!result.ok) {
          throw new Error(await getResponseErrorMessage(result));
        }

        const reader = result.body?.getReader();

        if (!reader) throw new Error('No reader available');

        let reading = true;
        while (reading) {
          const { done, value } = await reader.read();
          if (done) {
            reading = false;
            break;
          }

          const chunk = new TextDecoder().decode(value);
          setText((prev) => prev + chunk);
        }
      } catch (error) {
        const errorMessage = getFriendlyAiErrorMessage(error, t);
        setError(errorMessage);
        console.error('Error streaming AI response:', error);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    },
    [baseId, t, timeout]
  );

  const stop = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  return { text, generateAIResponse, loading, error, stop };
};
