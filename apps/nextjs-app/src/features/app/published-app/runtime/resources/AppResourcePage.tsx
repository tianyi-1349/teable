import type { ReactNode } from 'react';
import { PublishedResourcePageFrame } from './PublishedResourcePageFrame';

export const AppResourcePage = ({ children }: { children: ReactNode }) => {
  return (
    <PublishedResourcePageFrame
      title="Published app"
      description="Embedded app pages inherit published shell behavior and keep external runtime boundaries explicit."
    >
      {children}
    </PublishedResourcePageFrame>
  );
};
