import { usePublishedApp } from '../context';
import { PublishedAppNavItem } from './PublishedAppNavItem';

export const PublishedAppDrawer = () => {
  const { activeNavigationItem, manifest, navigateToNode, navigation } = usePublishedApp();

  return (
    <aside className="hidden w-20 shrink-0 flex-col border-r bg-muted/20 p-2 sm:flex">
      <div className="mb-2 border-b pb-2 text-center text-xs font-semibold text-muted-foreground">
        {manifest.title?.slice(0, 2) || 'TA'}
      </div>
      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto">
        {navigation.flatItems.map((item) => (
          <PublishedAppNavItem
            key={item.nodeId}
            item={item}
            activeNodeId={activeNavigationItem?.nodeId}
            compact
            onNavigate={navigateToNode}
          />
        ))}
      </nav>
    </aside>
  );
};
