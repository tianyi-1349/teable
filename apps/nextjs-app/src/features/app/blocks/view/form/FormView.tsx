import { useIsReadOnlyPreview } from '@teable/sdk/hooks';
import { cn } from '@teable/ui-lib/shadcn';
import { useOptionalPublishedApp } from '@/features/app/published-app';
import { FormToolBar } from '../tool-bar/FormToolBar';
import { FormViewBase } from './FormViewBase';

export const FormView = () => {
  const isReadOnlyPreview = useIsReadOnlyPreview();
  const publishedApp = useOptionalPublishedApp();
  const showToolbar = !isReadOnlyPreview && !publishedApp?.isReadonly;

  return (
    <div
      className={cn('flex min-h-0 flex-1 flex-col', {
        'bg-muted/10': Boolean(publishedApp),
      })}
    >
      {showToolbar && <FormToolBar />}
      <div className="w-full grow overflow-y-auto">
        <FormViewBase />
      </div>
    </div>
  );
};
