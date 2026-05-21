import { useTranslation } from 'next-i18next';
import type { FC } from 'react';
import { getFriendlyErrorMessage } from '@/lib/get-friendly-error-message';
import { IllustrationPage } from './IllustrationPage';

type Props = {
  statusCode?: number | null;
  error?: Error;
  message?: string;
  errorId?: string;
  children?: never;
};

export const ErrorPage: FC<Props> = (props) => {
  const { error, errorId, message, statusCode } = props;
  const { t } = useTranslation('common');
  const displayMessage = message ? getFriendlyErrorMessage(new Error(message), t) : undefined;
  const displayErrorMessage = error ? getFriendlyErrorMessage(error, t) : undefined;

  return (
    <div className="relative">
      <IllustrationPage
        imageLightSrc="/images/layout/error-light.png"
        imageDarkSrc="/images/layout/error-dark.png"
        imageAlt={t('system.error.title')}
        title={t('system.error.title')}
        description={t('system.error.description')}
        button={{ label: t('system.links.backToHome'), href: '/' }}
      />
      <div className="absolute bottom-0 right-0 m-5 flex flex-col gap-1 rounded-lg border bg-background p-4 text-left text-sm">
        <div className="flex gap-2" data-testid="error-status-code">
          <span className="text-muted-foreground">{t('system.error.code')}: </span>
          <span className="text-foreground">{statusCode}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground">{t('system.error.message')}: </span>
          <span className="text-foreground">{displayMessage}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground">{t('system.error.errorId')}: </span>
          <span className="text-foreground">{errorId}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground">{t('system.error.errorMessage')}: </span>
          <span className="text-foreground">{displayErrorMessage}</span>
        </div>
      </div>
    </div>
  );
};
