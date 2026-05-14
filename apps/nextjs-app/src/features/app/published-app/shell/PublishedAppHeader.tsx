import { usePublishedApp } from '../context';

export const PublishedAppHeader = () => {
  const { activeNavigationItem, manifest } = usePublishedApp();
  const title = activeNavigationItem?.title || manifest.title || 'Published app';

  return (
    <header className="flex h-12 shrink-0 items-center border-b bg-background px-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{manifest.title}</div>
      </div>
    </header>
  );
};
