import { getNodeUrl } from '@/features/app/blocks/base/base-node/hooks';
import type { PublishedAppManifest, PublishedAppNode } from '../manifest';

export const getPublishedNodeUrl = (props: {
  manifest: PublishedAppManifest;
  node: PublishedAppNode;
}) => {
  const { manifest, node } = props;
  const url = getNodeUrl({
    baseId: manifest.baseId,
    resourceType: node.resourceType,
    resourceId: node.resourceId,
    urlPrefix: manifest.shareId ? `/share/${manifest.shareId}` : undefined,
  });

  return url?.pathname ?? undefined;
};
