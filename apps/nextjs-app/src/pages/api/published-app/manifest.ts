import type { NextApiRequest, NextApiResponse } from 'next';

interface WebAppManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

interface WebAppManifest {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
  scope: string;
  display: 'standalone';
  background_color: string;
  theme_color: string;
  icons: WebAppManifestIcon[];
}

const MAX_TEXT_LENGTH = 80;
const DEFAULT_NAME = 'Teable App';
const DEFAULT_SHORT_NAME = 'Teable';
const DEFAULT_DESCRIPTION = 'Published Teable app';
const DEFAULT_COLOR = '#ffffff';

const ICONS: WebAppManifestIcon[] = [
  {
    src: '/images/favicon/android-chrome-192x192.png',
    sizes: '192x192',
    type: 'image/png',
  },
  {
    src: '/images/favicon/android-chrome-512x512.png',
    sizes: '512x512',
    type: 'image/png',
  },
  {
    src: '/images/favicon/android-chrome-maskable-192x192.png',
    sizes: '192x192',
    type: 'image/png',
    purpose: 'maskable',
  },
  {
    src: '/images/favicon/android-chrome-maskable-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable',
  },
];

const getQueryText = (value: string | string[] | undefined, fallback: string) => {
  const text = Array.isArray(value) ? value[0] : value;
  const normalized = text?.trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.slice(0, MAX_TEXT_LENGTH);
};

const getSafePath = (value: string | string[] | undefined, fallback: string) => {
  const path = getQueryText(value, fallback);

  if (!path.startsWith('/') || path.startsWith('//')) {
    return fallback;
  }

  return path;
};

export default function publishedAppManifestApiRoute(
  req: NextApiRequest,
  res: NextApiResponse<WebAppManifest | void>
) {
  if (req.method !== 'GET') {
    res.status(400).end();
    return;
  }

  const payload: WebAppManifest = {
    name: getQueryText(req.query.name, DEFAULT_NAME),
    short_name: getQueryText(req.query.short_name, DEFAULT_SHORT_NAME),
    description: getQueryText(req.query.description, DEFAULT_DESCRIPTION),
    start_url: getSafePath(req.query.start_url, '/'),
    scope: getSafePath(req.query.scope, '/'),
    display: 'standalone',
    background_color: DEFAULT_COLOR,
    theme_color: DEFAULT_COLOR,
    icons: ICONS,
  };

  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store');
  res.status(200).json(payload);
}
