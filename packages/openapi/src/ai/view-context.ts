import type { IFilter, IGroup, ISortItem } from '@teable/core';
import { z } from '../zod';

export interface IAiViewContextQuery {
  tableId: string;
  viewId?: string;
  ignoreViewQuery?: boolean;
  filter?: IFilter;
  orderBy?: ISortItem[];
  groupBy?: IGroup;
  search?: string[];
  sampleSize?: number;
}

export interface IAiViewContextField {
  id: string;
  name: string;
  type: string;
  isPrimary: boolean;
  visible: boolean;
}

export interface IAiViewContextVo {
  tableId: string;
  viewId?: string;
  summary: {
    totalCount: number;
    sampleSize: number;
    appliedViewQuery: boolean;
  };
  view?: {
    id: string;
    name: string;
    type: string;
    filter?: IFilter;
    sort?: ISortItem[];
    group?: IGroup;
    columnMeta?: unknown;
  };
  effectiveQuery: {
    filter?: IFilter;
    orderBy?: ISortItem[];
    groupBy?: IGroup;
    search?: [string] | [string, string] | [string, string, boolean];
  };
  fields: IAiViewContextField[];
  sampleRecords: unknown[];
}

export const aiViewContextQuerySchema = z.object({
  tableId: z.string(),
  viewId: z.string().optional(),
  ignoreViewQuery: z.boolean().optional(),
  filter: z.unknown().optional(),
  orderBy: z.unknown().optional(),
  groupBy: z.unknown().optional(),
  search: z.array(z.string()).optional(),
  sampleSize: z.number().int().positive().max(50).optional(),
});
