import type { GetServerSideProps } from 'next';
import type { ReactElement } from 'react';
import { SsrApi } from '@/backend/api/rest/ssr-api';
import type { ISSRContext } from '@/features/app/base-node';
import { BaseNodePageSwitch, getResourcePageProps } from '@/features/app/base-node';
import type { IShareBasePagePropsBase } from '@/features/app/blocks/share/base/share-base-ssr';
import { createShareBaseSSR } from '@/features/app/blocks/share/base/share-base-ssr';
import type { IBaseResourceParsed } from '@/features/app/hooks/useBaseResource';
import { ShareBaseLayout } from '@/features/app/layouts/ShareBaseLayout';
import type { NextPageWithLayout } from '@/lib/type';
import withEnv from '@/lib/withEnv';

export type IShareBasePageProps = IShareBasePagePropsBase;

const ShareBasePage: NextPageWithLayout<IShareBasePageProps> = (props: IShareBasePageProps) => {
  return <BaseNodePageSwitch {...props} />;
};

const getShareResourcePageProps = async (
  ctx: ISSRContext,
  parsed: IBaseResourceParsed,
  queryParams: Record<string, string | string[] | undefined>
) => {
  return getResourcePageProps(ctx, parsed, queryParams);
};

export const getServerSideProps: GetServerSideProps<IShareBasePageProps> =
  withEnv<IShareBasePageProps>(async (context) => {
    const ssrApi = new SsrApi();
    return createShareBaseSSR<IShareBasePageProps>({
      ssrApi,
      context,
      getResourcePageProps: getShareResourcePageProps,
    });
  });

ShareBasePage.getLayout = function getLayout(page: ReactElement, pageProps: IShareBasePageProps) {
  return <ShareBaseLayout {...pageProps}>{page}</ShareBaseLayout>;
};

export default ShareBasePage;
