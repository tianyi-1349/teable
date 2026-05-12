import { Frown } from '@teable/icons';
import { Alert, AlertDescription, AlertTitle } from '@teable/ui-lib/shadcn/ui/alert';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface PublishedResourceErrorBoundaryProps {
  children: ReactNode;
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
            <AlertTitle>Unable to load this page</AlertTitle>
            <AlertDescription>
              Refresh the page or open another published page to continue.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
