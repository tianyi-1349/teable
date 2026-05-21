import { useTranslation } from 'next-i18next';
import type { ReactNode } from 'react';
import { PublishedResourcePageFrame } from './PublishedResourcePageFrame';

export const AppResourcePage = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common');

  return (
    <PublishedResourcePageFrame
      title={t('system.publishedApp.publishedAppTitle')}
      description={t('system.publishedApp.publishedAppDescription')}
    >
      {children}
    </PublishedResourcePageFrame>
  );
};
