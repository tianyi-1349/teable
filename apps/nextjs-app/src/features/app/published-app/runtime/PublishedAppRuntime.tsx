import type { ReactNode } from 'react';
import { PublishedAppPwaMeta } from '../pwa';
import { PublishedAppShell } from '../shell';
import { PublishedResourceRenderer } from './PublishedResourceRenderer';

const isPublishedAppShellDisabled = process.env.NEXT_PUBLIC_PUBLISHED_APP_SHELL_DISABLED === 'true';

export const PublishedAppRuntime = ({ children }: { children: ReactNode }) => {
  const content = <PublishedResourceRenderer>{children}</PublishedResourceRenderer>;

  return (
    <>
      <PublishedAppPwaMeta />
      {isPublishedAppShellDisabled ? content : <PublishedAppShell>{content}</PublishedAppShell>}
    </>
  );
};
