import type { ReactNode } from 'react';
import { PublishedResourceErrorBoundary } from './PublishedResourceErrorBoundary';

export const PublishedResourceRenderer = ({ children }: { children: ReactNode }) => {
  return <PublishedResourceErrorBoundary>{children}</PublishedResourceErrorBoundary>;
};
