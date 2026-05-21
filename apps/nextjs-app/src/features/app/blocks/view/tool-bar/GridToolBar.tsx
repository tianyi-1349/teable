import { Plus } from '@teable/icons';
import { CreateRecordModal } from '@teable/sdk/components';
import { useIsMobile, useIsReadOnlyPreview, useTablePermission } from '@teable/sdk/hooks';
import { cn } from '@teable/ui-lib/shadcn';
import { Button } from '@teable/ui-lib/shadcn/ui/button';
import { useTranslation } from 'next-i18next';
import { useOptionalPublishedApp } from '@/features/app/published-app';
import { tableConfig } from '@/features/i18n/table.config';
import { GridViewOperators } from './components';
import { useViewConfigurable } from './hook';
import { Others } from './Others';

export const GridToolBar: React.FC = () => {
  const permission = useTablePermission();
  const { isViewConfigurable } = useViewConfigurable();
  const { t } = useTranslation(tableConfig.i18nNamespaces);
  const isReadOnlyPreview = useIsReadOnlyPreview();
  const isMobile = useIsMobile();
  const publishedApp = useOptionalPublishedApp();
  const isPublishedMobile = Boolean(publishedApp && isMobile);
  const canCreateRecord = Boolean(permission['record|create'] && !publishedApp?.isReadonly);

  return (
    <div
      className={cn(
        'flex h-[48px] items-center border-t px-1 py-2 sm:gap-1 sm:px-2 md:gap-2 md:px-4',
        {
          'h-auto flex-wrap gap-2 px-3 py-3': isPublishedMobile,
        }
      )}
    >
      {!isReadOnlyPreview && (
        <CreateRecordModal>
          <Button size={'xs'} variant={'outline'} disabled={!canCreateRecord}>
            <Plus className="size-4" />
            {t('table:view.addRecord')}
          </Button>
        </CreateRecordModal>
      )}
      <div
        className={cn('flex flex-1 justify-between @container/toolbar', {
          'min-w-0 flex-col gap-2': isPublishedMobile,
        })}
      >
        <GridViewOperators disabled={!isViewConfigurable} compact={isPublishedMobile} />
        <Others />
      </div>
    </div>
  );
};
