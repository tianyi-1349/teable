import { useTranslation } from 'next-i18next';
import { usePublishedApp } from '../context';
import { PublishedAppNavItem } from './PublishedAppNavItem';
import type { PublishedAppShellProps } from './types';

export const DesktopShell = ({ children }: PublishedAppShellProps) => {
  const { t } = useTranslation('common');
  const { activeNavigationItem, manifest, navigateToNode, navigation } = usePublishedApp();

  return (
    <div className="flex h-screen min-h-0 bg-background">
      <aside className="flex w-64 shrink-0 flex-col border-r bg-muted/20">
        <div className="border-b px-4 py-3">
          <div className="truncate text-sm font-semibold">{manifest.title || 'Published app'}</div>
          <div className="text-xs text-muted-foreground">
            {t('system.publishedApp.publishedRuntime')}
          </div>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {navigation.flatItems.map((item) => (
            <PublishedAppNavItem
              key={item.nodeId}
              item={item}
              activeNodeId={activeNavigationItem?.nodeId}
              onNavigate={navigateToNode}
            />
          ))}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
};
