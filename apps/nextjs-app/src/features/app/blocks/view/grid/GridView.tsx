import {
  AggregationProvider,
  RecordProvider,
  RowCountProvider,
  TaskStatusCollectionProvider,
} from '@teable/sdk/context';
import { SearchProvider } from '@teable/sdk/context/query';
import { useIsMobile, usePersonalView } from '@teable/sdk/hooks';
import { cn } from '@teable/ui-lib/shadcn';
import { useOptionalPublishedApp } from '@/features/app/published-app';
import { GridToolBar } from '../tool-bar/GridToolBar';
import type { IViewBaseProps } from '../types';
import { GridViewBase } from './GridViewBase';

export const GridView = (props: IViewBaseProps) => {
  const { recordServerData, recordsServerData, groupPointsServerDataMap } = props;
  const { personalViewCommonQuery, personalViewAggregationQuery } = usePersonalView();
  const publishedApp = useOptionalPublishedApp();
  const isMobile = useIsMobile();
  const isPublishedMobile = Boolean(publishedApp && isMobile);

  return (
    <SearchProvider>
      <RecordProvider serverRecords={recordsServerData.records} serverRecord={recordServerData}>
        <AggregationProvider query={personalViewAggregationQuery}>
          <TaskStatusCollectionProvider>
            <RowCountProvider query={personalViewCommonQuery}>
              <div
                className={cn('flex min-h-0 flex-1 flex-col', {
                  'bg-muted/10': isPublishedMobile,
                })}
              >
                <div
                  className={cn({
                    'sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80':
                      isPublishedMobile,
                  })}
                >
                  <GridToolBar />
                </div>
                <div className="px-3 pb-3 pt-2 text-xs text-muted-foreground sm:hidden">
                  Tap a row to open record details. Search and filter actions stay available in the
                  compact toolbar.
                </div>
                <div className="w-full grow overflow-hidden sm:pl-2">
                  <GridViewBase groupPointsServerDataMap={groupPointsServerDataMap} />
                </div>
              </div>
            </RowCountProvider>
          </TaskStatusCollectionProvider>
        </AggregationProvider>
      </RecordProvider>
    </SearchProvider>
  );
};
