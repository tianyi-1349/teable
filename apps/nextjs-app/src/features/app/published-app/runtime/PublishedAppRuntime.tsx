import type { ReactNode } from 'react';
import { PublishedAppShell } from '../shell';
import { PublishedResourceRenderer } from './PublishedResourceRenderer';

export const PublishedAppRuntime = ({ children }: { children: ReactNode }) => {
  return (
    <PublishedAppShell>
      <PublishedResourceRenderer>{children}</PublishedResourceRenderer>
    </PublishedAppShell>
  );
};
