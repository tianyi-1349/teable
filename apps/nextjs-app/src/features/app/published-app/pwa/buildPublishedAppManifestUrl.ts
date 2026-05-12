import type { PublishedAppManifest } from '../manifest';

const PUBLISHED_APP_MANIFEST_API = '/api/published-app/manifest';

const getSafePath = (path?: string) => {
  if (!path || !path.startsWith('/') || path.startsWith('//')) {
    return '/';
  }

  return path;
};

const appendParam = (params: URLSearchParams, key: string, value?: string | null) => {
  if (value) {
    params.set(key, value);
  }
};

export const buildPublishedAppManifestUrl = ({
  manifest,
  startUrl,
}: {
  manifest: PublishedAppManifest;
  startUrl?: string;
}) => {
  const params = new URLSearchParams();
  const safeStartUrl = getSafePath(startUrl);
  const scope = manifest.shareId
    ? `/share/${manifest.shareId}/base/${manifest.baseId}/`
    : `/base/${manifest.baseId}/`;

  appendParam(params, 'name', manifest.title || 'Teable App');
  appendParam(params, 'short_name', manifest.title || 'Teable');
  appendParam(params, 'start_url', safeStartUrl);
  appendParam(params, 'scope', scope);
  appendParam(params, 'description', 'Published Teable app');

  return `${PUBLISHED_APP_MANIFEST_API}?${params.toString()}`;
};
