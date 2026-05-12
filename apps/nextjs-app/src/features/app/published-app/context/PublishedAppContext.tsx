import type { IGetBaseVo } from '@teable/openapi';
import { BaseNodeResourceType } from '@teable/openapi';
import { useIsMobile } from '@teable/sdk/hooks';
import { useRouter } from 'next/router';
import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { BaseNodeContext } from '@/features/app/blocks/base/base-node/BaseNodeContext';
import type { TreeItemData } from '@/features/app/blocks/base/base-node/hooks';
import { ROOT_ID } from '@/features/app/blocks/base/base-node/hooks';
import { useBaseResource } from '@/features/app/hooks/useBaseResource';
import { buildPublishedAppManifest } from '../manifest';
import type { PublishedAppManifest, PublishedAppNode } from '../manifest';
import { buildPublishedNavigation } from '../navigation';
import type { PublishedNavigationItem, PublishedNavigationModel } from '../navigation';
import { useIsPwaStandalone } from '../pwa';

export interface PublishedAppContextValue {
  manifest: PublishedAppManifest;
  navigation: PublishedNavigationModel;
  currentNode?: PublishedAppNode;
  defaultNode?: PublishedAppNode;
  activeNavigationItem?: PublishedNavigationItem;
  isShare: boolean;
  isReadonly: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isEmbed: boolean;
  isPwaStandalone: boolean;
  navigateToNode: (nodeId: string) => void;
}

export interface PublishedAppProviderProps {
  children: ReactNode;
  base?: IGetBaseVo;
  shareId?: string;
  shareNodeId?: string;
  allowSave?: boolean;
  allowCopy?: boolean;
  allowEdit?: boolean;
}

export const PublishedAppContext = createContext<PublishedAppContextValue | undefined>(undefined);

const getResourceIdFromRoute = (resource: ReturnType<typeof useBaseResource>) => {
  switch (resource.resourceType) {
    case BaseNodeResourceType.Table:
      return resource.tableId;
    case BaseNodeResourceType.Dashboard:
      return resource.dashboardId;
    case BaseNodeResourceType.Workflow:
      return resource.workflowId;
    case BaseNodeResourceType.App:
      return resource.appId;
    default:
      return undefined;
  }
};

const getSourceNodes = (treeItems: Record<string, TreeItemData>) => {
  return Object.values(treeItems).filter((node) => node.id !== ROOT_ID);
};

export const PublishedAppProvider = ({
  children,
  base,
  shareId,
  shareNodeId,
  allowSave,
  allowCopy,
  allowEdit,
}: PublishedAppProviderProps) => {
  const router = useRouter();
  const resource = useBaseResource();
  const isMobile = useIsMobile();
  const isPwaStandalone = useIsPwaStandalone();
  const { treeItems } = useContext(BaseNodeContext);

  const manifest = useMemo(() => {
    return buildPublishedAppManifest({
      baseId: resource.baseId,
      title: base?.name ?? '',
      icon: base?.icon,
      shareId,
      shareNodeId,
      nodes: getSourceNodes(treeItems),
      permissions: {
        allowSave,
        allowCopy,
        allowEdit,
        readonly: !allowEdit,
      },
      mode: shareId ? 'share' : 'authenticated',
    });
  }, [
    allowCopy,
    allowEdit,
    allowSave,
    base?.icon,
    base?.name,
    resource.baseId,
    shareId,
    shareNodeId,
    treeItems,
  ]);

  const resourceId = getResourceIdFromRoute(resource);
  const currentNode = manifest.nodes.find(
    (node) => node.resourceType === resource.resourceType && node.resourceId === resourceId
  );
  const defaultNode = manifest.nodes.find((node) => node.nodeId === manifest.defaultNodeId);
  const navigation = useMemo(() => {
    return buildPublishedNavigation({ manifest, currentNode });
  }, [currentNode, manifest]);

  const value = useMemo<PublishedAppContextValue>(() => {
    return {
      manifest,
      navigation,
      currentNode,
      defaultNode,
      activeNavigationItem: navigation.activeItem,
      isShare: Boolean(shareId),
      isReadonly: !allowEdit,
      isMobile,
      isTablet: false,
      isEmbed: false,
      isPwaStandalone,
      navigateToNode: (nodeId: string) => {
        const item = navigation.flatItems.find((navItem) => navItem.nodeId === nodeId);
        if (item?.url) {
          router.push(item.url);
        }
      },
    };
  }, [
    allowEdit,
    currentNode,
    defaultNode,
    isMobile,
    isPwaStandalone,
    manifest,
    navigation,
    router,
    shareId,
  ]);

  return <PublishedAppContext.Provider value={value}>{children}</PublishedAppContext.Provider>;
};

export const usePublishedApp = () => {
  const context = useContext(PublishedAppContext);
  if (!context) {
    throw new Error('usePublishedApp must be used within PublishedAppProvider');
  }
  return context;
};

export const useOptionalPublishedApp = () => {
  return useContext(PublishedAppContext);
};
