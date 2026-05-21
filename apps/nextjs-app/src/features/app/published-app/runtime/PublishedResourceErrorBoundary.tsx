import { Frown } from '@teable/icons';
import { Alert, AlertDescription, AlertTitle } from '@teable/ui-lib/shadcn/ui/alert';
import { useTranslation } from 'next-i18next';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface PublishedResourceErrorBoundaryProps {
  children: ReactNode;
  title: string;
  description: string;
}

interface PublishedResourceErrorBoundaryState {
  hasError: boolean;
}

export class PublishedResourceErrorBoundary extends Component<
  PublishedResourceErrorBoundaryProps,
  PublishedResourceErrorBoundaryState
> {
  state: PublishedResourceErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Published app resource crashed', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex size-full min-h-[360px] items-center justify-center p-6">
          <Alert className="max-w-md">
            <Frown className="size-5" />
            <AlertTitle>{this.props.title}</AlertTitle>
            <AlertDescription>{this.props.description}</AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}

export const PublishedResourceErrorBoundaryI18n = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('common');

  return (
    <PublishedResourceErrorBoundary
      title={t('system.publishedApp.loadFailedTitle')}
      description={t('system.publishedApp.loadFailedDescription')}
    >
      {children}
    </PublishedResourceErrorBoundary>
  );
};
