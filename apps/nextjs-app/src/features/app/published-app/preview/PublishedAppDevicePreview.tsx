import { Monitor, Tablet, Smartphone, PanelsTopLeft, AppWindow } from 'lucide-react';
import type { PublishedAppValidationIssue } from './validatePublishedAppConfig';

type RuntimeTarget = 'desktop' | 'tablet' | 'mobile' | 'embed' | 'pwa';

interface PublishedAppDevicePreviewProps {
  selectedNodeCount: number;
  defaultNodeTitle?: string;
  issues: PublishedAppValidationIssue[];
}

const TARGETS: { key: RuntimeTarget; label: string; icon: typeof Monitor }[] = [
  { key: 'desktop', label: 'Desktop', icon: Monitor },
  { key: 'tablet', label: 'Tablet', icon: Tablet },
  { key: 'mobile', label: 'Mobile', icon: Smartphone },
  { key: 'embed', label: 'Embed', icon: PanelsTopLeft },
  { key: 'pwa', label: 'PWA', icon: AppWindow },
];

export const PublishedAppDevicePreview = ({
  selectedNodeCount,
  defaultNodeTitle,
  issues,
}: PublishedAppDevicePreviewProps) => {
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;
  const infoCount = issues.filter((issue) => issue.severity === 'info').length;

  return (
    <div className="rounded-md border bg-background/80 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Runtime Preview Targets</p>
        <span className="text-xs text-muted-foreground">{selectedNodeCount} selected nodes</span>
      </div>
      <div className="mb-3 grid grid-cols-5 gap-2">
        {TARGETS.map(({ key, label, icon: Icon }) => (
          <div
            key={key}
            className="flex flex-col items-center gap-1 rounded border bg-muted/30 py-2 text-xs text-muted-foreground"
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-muted px-2 py-1 text-muted-foreground">
          Default: {defaultNodeTitle || 'Unset'}
        </span>
        <span className="rounded bg-destructive/10 px-2 py-1 text-destructive">
          Errors: {errorCount}
        </span>
        <span className="rounded bg-amber-100 px-2 py-1 text-amber-700">
          Warnings: {warningCount}
        </span>
        <span className="rounded bg-slate-200 px-2 py-1 text-slate-700">Info: {infoCount}</span>
      </div>
    </div>
  );
};
