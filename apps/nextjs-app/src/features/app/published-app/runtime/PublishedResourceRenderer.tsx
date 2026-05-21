import type { ReactNode } from 'react';
import { PublishedResourceErrorBoundaryI18n } from './PublishedResourceErrorBoundary';
import { PublishedResourceSwitch } from './PublishedResourceSwitch';

export const PublishedResourceRenderer = ({ children }: { children: ReactNode }) => {
  return (
    <PublishedResourceErrorBoundaryI18n>
      <PublishedResourceSwitch>{children}</PublishedResourceSwitch>
    </PublishedResourceErrorBoundaryI18n>
  );
};
