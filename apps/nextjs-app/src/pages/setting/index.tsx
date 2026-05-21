import type { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import type { NextPageWithLayout } from '@/lib/type';

const Node: NextPageWithLayout = () => {
  const { t } = useTranslation('common');
  return <p>{t('status.redirecting')}</p>;
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: `/setting/personal-access-token`,
      permanent: false,
    },
  };
};

export default Node;
