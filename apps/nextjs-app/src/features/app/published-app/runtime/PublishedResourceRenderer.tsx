import type { ReactNode } from 'react';
import { PublishedResourceErrorBoundary } from './PublishedResourceErrorBoundary';
import { PublishedResourceSwitch } from './PublishedResourceSwitch';

export const PublishedResourceRenderer = ({ children }: { children: ReactNode }) => {
  return (
    <PublishedResourceErrorBoundary>
      <PublishedResourceSwitch>{children}</PublishedResourceSwitch>
    </PublishedResourceErrorBoundary>
  );
};
