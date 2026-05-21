import { useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

const getAsyncError = async (): Promise<void> => {
  throw new Error(
    'Error purposely crafted for monitoring sentry (/pages/_monitor/sentry/csr-page.tsx)'
  );
};

const MonitorSentryCsrRoute: FC = () => {
  const [error, setError] = useState<Error | null>(null);
  const { t } = useTranslation('common');

  useEffect(() => {
    getAsyncError().catch((err) => setError(err));
  }, []);

  if (error) {
    throw error;
  }
  return (
    <div>
      <h1>{t('monitor.unexpectedErrorTitle')}</h1>
      <p>{t('monitor.csrDescription')}</p>
    </div>
  );
};

export default MonitorSentryCsrRoute;
