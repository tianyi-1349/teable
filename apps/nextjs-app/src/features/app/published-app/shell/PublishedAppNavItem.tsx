import { cn } from '@teable/ui-lib/shadcn';
import { BaseNodeResourceIconMap } from '@/features/app/blocks/base/base-node/hooks';
import type { PublishedNavigationItem } from '../navigation';

interface PublishedAppNavItemProps {
  item: PublishedNavigationItem;
  activeNodeId?: string;
  compact?: boolean;
  onNavigate: (nodeId: string) => void;
}

export const PublishedAppNavItem = ({
  activeNodeId,
  compact,
  item,
  onNavigate,
}: PublishedAppNavItemProps) => {
  const Icon = BaseNodeResourceIconMap[item.resourceType];
  const isActive = item.nodeId === activeNodeId;

  return (
    <button
      type="button"
      disabled={!item.renderable}
      onClick={() => onNavigate(item.nodeId)}
      className={cn(
        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        !item.renderable && 'cursor-not-allowed opacity-50',
        compact && 'justify-center px-2'
      )}
      title={item.title}
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      {compact ? null : <span className="truncate">{item.title || 'Untitled'}</span>}
    </button>
  );
};
