import type { BaseNodeResourceType, IBaseNodeResourceMeta } from '@teable/openapi';

export type PublishedRuntimeTarget = 'desktop-web' | 'tablet-web' | 'mobile-web' | 'embed' | 'pwa';

export type PublishedAppMode = 'authenticated' | 'share' | 'template';

export interface PublishedAppPermissions {
  allowSave: boolean;
  allowCopy: boolean;
  allowEdit: boolean;
  readonly: boolean;
}

export interface PublishedAppNode {
  nodeId: string;
  resourceId: string;
  resourceType: BaseNodeResourceType;
  title: string;
  icon?: string | null;
  parentId?: string | null;
  children: string[];
  visibleInNav: boolean;
  renderable: boolean;
}

export interface PublishedAppManifest {
  baseId: string;
  shareId?: string;
  title: string;
  icon?: string | null;
  defaultNodeId?: string | null;
  nodes: PublishedAppNode[];
  permissions: PublishedAppPermissions;
  mode: PublishedAppMode;
  runtimeTargets: PublishedRuntimeTarget[];
}

export interface PublishedAppSourceNode {
  id: string;
  parentId?: string | null;
  resourceId: string;
  resourceType: BaseNodeResourceType;
  resourceMeta?: IBaseNodeResourceMeta;
  children?: string[];
}

export interface BuildPublishedAppManifestInput {
  baseId: string;
  title: string;
  icon?: string | null;
  shareId?: string;
  shareNodeId?: string | null;
  nodes: PublishedAppSourceNode[];
  permissions?: Partial<PublishedAppPermissions>;
  mode: PublishedAppMode;
}
