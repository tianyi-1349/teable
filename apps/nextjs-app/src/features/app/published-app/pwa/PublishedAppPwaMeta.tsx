import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { usePublishedApp } from '../context';
import { buildPublishedAppManifestUrl } from './buildPublishedAppManifestUrl';

const DEFAULT_THEME_COLOR = '#ffffff';

export const PublishedAppPwaMeta = () => {
  const router = useRouter();
  const { manifest } = usePublishedApp();
  const title = manifest.title || 'Teable App';
  const manifestUrl = useMemo(() => {
    return buildPublishedAppManifestUrl({ manifest, startUrl: router.asPath });
  }, [manifest, router.asPath]);

  return (
    <Head>
      <title>{title}</title>
      <meta name="application-name" content={title} />
      <meta name="apple-mobile-web-app-title" content={title} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content={DEFAULT_THEME_COLOR} />
      <link rel="manifest" href={manifestUrl} />
    </Head>
  );
};
