import { ResourceType } from '../types';

export const TrashType = {
  Space: ResourceType.Space,
  Base: ResourceType.Base,
  Table: ResourceType.Table,
  App: ResourceType.App,
  Workflow: ResourceType.Workflow,
} as const;

export type TrashType = (typeof TrashType)[keyof typeof TrashType];

export const TableTrashType = {
  View: ResourceType.View,
  Field: ResourceType.Field,
  Record: ResourceType.Record,
} as const;

export type TableTrashType = (typeof TableTrashType)[keyof typeof TableTrashType];
