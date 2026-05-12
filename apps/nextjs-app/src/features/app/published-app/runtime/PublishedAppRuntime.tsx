import type { ReactNode } from 'react';
import { PublishedAppPwaMeta } from '../pwa';
import { PublishedAppShell } from '../shell';
import { PublishedResourceRenderer } from './PublishedResourceRenderer';

export const PublishedAppRuntime = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <PublishedAppPwaMeta />
      <PublishedAppShell>
        <PublishedResourceRenderer>{children}</PublishedResourceRenderer>
      </PublishedAppShell>
    </>
  );
};
