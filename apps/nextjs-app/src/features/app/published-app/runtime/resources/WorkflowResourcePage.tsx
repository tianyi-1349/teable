import { useTranslation } from 'next-i18next';
import type { ReactNode } from 'react';
import { PublishedResourcePageFrame } from './PublishedResourcePageFrame';

export const WorkflowResourcePage = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common');

  return (
    <PublishedResourcePageFrame
      title={t('system.publishedApp.publishedWorkflowTitle')}
      description={t('system.publishedApp.publishedWorkflowDescription')}
    >
      {children}
    </PublishedResourcePageFrame>
  );
};
