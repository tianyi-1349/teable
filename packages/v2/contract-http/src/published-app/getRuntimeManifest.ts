import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const publishedAppRuntimeNodeSchema = z.object({
  nodeId: z.string(),
  resourceId: z.string(),
  resourceType: z.string(),
  title: z.string(),
  icon: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  children: z.array(z.string()),
  visibleInNav: z.boolean(),
  renderable: z.boolean(),
});

export const publishedAppRuntimeManifestSchema = z.object({
  baseId: z.string(),
  shareId: z.string().optional(),
  title: z.string(),
  icon: z.string().nullable().optional(),
  defaultNodeId: z.string().nullable().optional(),
  defaultUrl: z.string().optional(),
  nodes: z.array(publishedAppRuntimeNodeSchema),
  permissions: z.object({
    allowSave: z.boolean(),
    allowCopy: z.boolean(),
    allowEdit: z.boolean(),
    readonly: z.boolean(),
  }),
  shareMeta: z
    .object({
      passwordRestricted: z.boolean(),
    })
    .optional(),
  mode: z.enum(['authenticated', 'share', 'template']),
  runtimeTargets: z.array(z.enum(['desktop-web', 'tablet-web', 'mobile-web', 'embed', 'pwa'])),
});

export const getPublishedAppRuntimeManifestInputSchema = z.object({
  shareId: z.string(),
});

export type IGetPublishedAppRuntimeManifestRequestDto = z.input<
  typeof getPublishedAppRuntimeManifestInputSchema
>;

export type IPublishedAppRuntimeManifestDto = z.infer<typeof publishedAppRuntimeManifestSchema>;

export interface IGetPublishedAppRuntimeManifestResponseDataDto {
  manifest: IPublishedAppRuntimeManifestDto;
}

export type IGetPublishedAppRuntimeManifestResponseDto =
  IApiResponseDto<IGetPublishedAppRuntimeManifestResponseDataDto>;
export type IGetPublishedAppRuntimeManifestOkResponseDto =
  IApiOkResponseDto<IGetPublishedAppRuntimeManifestResponseDataDto>;
export type IGetPublishedAppRuntimeManifestErrorResponseDto = IApiErrorResponseDto;

export type IGetPublishedAppRuntimeManifestEndpointResult =
  | { status: 200; body: IGetPublishedAppRuntimeManifestOkResponseDto }
  | { status: HttpErrorStatus; body: IGetPublishedAppRuntimeManifestErrorResponseDto };

export const getPublishedAppRuntimeManifestResponseDataSchema = z.object({
  manifest: publishedAppRuntimeManifestSchema,
});

export const getPublishedAppRuntimeManifestOkResponseSchema = apiOkResponseDtoSchema(
  getPublishedAppRuntimeManifestResponseDataSchema
);
export const getPublishedAppRuntimeManifestErrorResponseSchema = apiErrorResponseDtoSchema;
