import { useTranslation } from 'next-i18next';
import { PublishedResourceState } from '../PublishedResourceState';

export const UnsupportedResourcePage = () => {
  const { t } = useTranslation('common');

  return (
    <PublishedResourceState
      title={t('system.publishedApp.resourceUnavailableTitle')}
      description={t('system.publishedApp.resourceUnavailableDescription')}
    />
  );
};
