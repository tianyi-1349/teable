import { RecordProvider, RowCountProvider, ShareViewContext } from '@teable/sdk/context';
import { SearchProvider } from '@teable/sdk/context/query';
import { useIsHydrated } from '@teable/sdk/hooks';
import { cn } from '@teable/ui-lib/shadcn';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { TeableLogo } from '@/components/TeableLogo';
import { useBrand } from '@/features/app/hooks/useBrand';
import { EmbedFooter } from '../../EmbedFooter';
import { AggregationProvider } from './aggregation';
import { GridViewBase } from './GridViewBase';
import { Toolbar } from './toolbar';

export const GridView = () => {
  const { records, view, extra } = useContext(ShareViewContext);
  const isHydrated = useIsHydrated();
  const { brandName } = useBrand();
  const {
    query: { hideToolBar, embed },
  } = useRouter();

  return (
    <div className={cn('flex size-full min-w-0 flex-col', embed ? '' : 'md:px-3 md:pb-3')}>
      {!embed && (
        <div className="flex w-full min-w-0 justify-between gap-2 px-1 py-2 md:px-0 md:py-3">
          <h1 className="min-w-0 truncate font-semibold md:text-lg">{view?.name}</h1>
          <Link href="/" className="flex shrink-0 items-center">
            <TeableLogo className="md:text-2xl" />
            <p className="ml-1 hidden font-semibold sm:block">{brandName}</p>
          </Link>
        </div>
      )}
      <div className="flex min-h-0 w-full grow flex-col overflow-hidden border md:rounded md:shadow-md">
        <SearchProvider>
          <RecordProvider serverRecords={records}>
            <AggregationProvider>
              <RowCountProvider>
                {!hideToolBar && <Toolbar />}
                {isHydrated && (
                  <div className="w-full grow overflow-hidden">
                    <GridViewBase groupPointsServerData={extra?.groupPoints} />
                  </div>
                )}
                {embed && <EmbedFooter />}
              </RowCountProvider>
            </AggregationProvider>
          </RecordProvider>
        </SearchProvider>
      </div>
    </div>
  );
};
