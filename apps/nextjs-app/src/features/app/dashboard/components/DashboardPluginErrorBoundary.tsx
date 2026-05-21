import { AlertTriangle } from '@teable/icons';
import { Alert, AlertDescription, AlertTitle } from '@teable/ui-lib/shadcn/ui/alert';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

interface DashboardPluginErrorBoundaryProps {
  children: ReactNode;
  name: string;
}

interface DashboardPluginErrorBoundaryState {
  hasError: boolean;
}

export class DashboardPluginErrorBoundary extends Component<
  DashboardPluginErrorBoundaryProps,
  DashboardPluginErrorBoundaryState
> {
  state: DashboardPluginErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Dashboard plugin crashed', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex size-full items-center justify-center p-3">
          <Alert className="max-w-sm">
            <AlertTriangle className="size-4" />
            <AlertTitle>{this.props.name}</AlertTitle>
            <AlertDescription>
              This plugin could not be rendered. Other dashboard cards remain available.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
