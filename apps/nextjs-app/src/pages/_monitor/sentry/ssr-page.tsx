import type { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';

type Props = {
  hasRunOnServer: boolean;
};

export default function MonitorSentrySsrRoute(
  _props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { t } = useTranslation('common');
  return (
    <div>
      <h1>{t('monitor.unexpectedErrorTitle')}</h1>
      <p>{t('monitor.ssrDescription')}</p>
    </div>
  );
}

/**
 * Always throws an error on purpose for monitoring
 */
export const getServerSideProps: GetServerSideProps<Props> = async (_context) => {
  throw new Error(
    'Error purposely crafted for monitoring sentry (/pages/_monitor/sentry/ssr-page.tsx)'
  );
};
