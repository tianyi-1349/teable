import { usePublishedApp } from '../context';
import { PublishedAppNavItem } from './PublishedAppNavItem';

export const PublishedAppBottomNav = () => {
  const { activeNavigationItem, navigateToNode, navigation } = usePublishedApp();
  const items = navigation.flatItems.filter((item) => item.renderable).slice(0, 5);

  if (items.length <= 1) {
    return null;
  }

  return (
    <nav
      className="grid shrink-0 gap-1 border-t bg-background p-2"
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map((item) => (
        <PublishedAppNavItem
          key={item.nodeId}
          item={item}
          activeNodeId={activeNavigationItem?.nodeId}
          compact
          onNavigate={navigateToNode}
        />
      ))}
    </nav>
  );
};
