import { dehydrate } from '@tanstack/react-query';
import { ArrowUpRight } from '@teable/icons';
import type { IBaseNodeAppResourceMeta } from '@teable/openapi';
import { BaseNodeResourceType } from '@teable/openapi';
import { Button } from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';
import type { IBaseResourceParsed } from '@/features/app/hooks/useBaseResource';
import { getDefaultNodeUrl, redirect } from './helper';
import type { IAppPageProps, ISSRContext, SSRResult } from './types';

const APP_IFRAME_SANDBOX =
  'allow-forms allow-popups allow-popups-to-escape-sandbox allow-scripts allow-downloads';

export const getAppServerSideProps = async (
  ctx: ISSRContext,
  parsed: IBaseResourceParsed
): Promise<SSRResult> => {
  const { ssrApi, baseId, queryClient, base } = ctx;
  if (parsed.resourceType !== BaseNodeResourceType.App) return { notFound: true };

  const { appId } = parsed;
  if (!appId) {
    const defaultUrl = await getDefaultNodeUrl(ctx);
    return defaultUrl ? redirect(defaultUrl) : redirect(`/base/${baseId}`);
  }

  const nodes = await queryClient.fetchQuery({
    queryKey: ['base-node-list', baseId],
    queryFn: () => ssrApi.getBaseNodeList(baseId),
  });
  const appNode = nodes.find(
    (node) => node.resourceType === BaseNodeResourceType.App && node.resourceId === appId
  );

  if (!appNode) {
    const defaultUrl = await getDefaultNodeUrl(ctx);
    return defaultUrl ? redirect(defaultUrl) : { notFound: true };
  }

  return {
    props: {
      ...(await ctx.getTranslationsProps()),
      dehydratedState: dehydrate(ctx.queryClient),
      base,
      appNode,
    },
  };
};

const AppUnavailableState = ({
  title,
  publicUrl,
}: {
  title: string;
  publicUrl?: string | null;
}) => {
  const { t } = useTranslation('common');
  return (
    <div className="flex h-full min-h-[360px] items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <div className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
          {t('publishedApp.appUnavailable')}
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">
          {publicUrl
            ? t('publishedApp.embedUnavailableDescription')
            : t('publishedApp.runtimeUrlMissingDescription')}
        </p>
        {publicUrl ? (
          <Button asChild>
            <a href={publicUrl} target="_blank" rel="noreferrer">
              {t('publishedApp.openApp')}
              <ArrowUpRight className="ml-2 size-4" />
            </a>
          </Button>
        ) : null}
      </div>
    </div>
  );
};

export const AppPage = ({ appNode }: IAppPageProps) => {
  const { t } = useTranslation('common');
  const appMeta = appNode?.resourceMeta as IBaseNodeAppResourceMeta | undefined;
  const title = appMeta?.name || 'App';
  const publicUrl = appMeta?.publicUrl;

  if (!publicUrl) {
    return <AppUnavailableState title={title} publicUrl={publicUrl} />;
  }

  return (
    <div className="flex h-full min-h-[480px] flex-col overflow-hidden bg-background">
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-2">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold">{title}</h1>
          <p className="truncate text-xs text-muted-foreground">
            {t('publishedApp.publishedRuntime')}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={publicUrl} target="_blank" rel="noreferrer">
            {t('publishedApp.openApp')}
            <ArrowUpRight className="ml-2 size-4" />
          </a>
        </Button>
      </div>
      <iframe
        title={title}
        src={publicUrl}
        className="min-h-0 flex-1 border-0"
        sandbox={APP_IFRAME_SANDBOX}
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    </div>
  );
};
