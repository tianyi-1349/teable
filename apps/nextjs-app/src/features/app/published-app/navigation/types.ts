import type { BaseNodeResourceType } from '@teable/openapi';

export type PublishedNavigationItemKind = 'node' | 'group';

export interface PublishedNavigationItem {
  nodeId: string;
  resourceId: string;
  resourceType: BaseNodeResourceType;
  title: string;
  icon?: string | null;
  kind: PublishedNavigationItemKind;
  renderable: boolean;
  url?: string;
  children: PublishedNavigationItem[];
}

export interface PublishedNavigationModel {
  items: PublishedNavigationItem[];
  flatItems: PublishedNavigationItem[];
  activeItem?: PublishedNavigationItem;
  defaultItem?: PublishedNavigationItem;
  isSingleNode: boolean;
  isCurrentNodeInScope: boolean;
}
