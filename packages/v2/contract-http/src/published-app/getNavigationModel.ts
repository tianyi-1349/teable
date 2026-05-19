import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export interface IPublishedNavigationItemDto {
  nodeId: string;
  resourceId: string;
  resourceType: string;
  title: string;
  icon?: string | null;
  kind: 'node' | 'group';
  renderable: boolean;
  url?: string;
  children: IPublishedNavigationItemDto[];
}

export const publishedNavigationItemSchema: z.ZodType<IPublishedNavigationItemDto> = z.lazy(() =>
  z.object({
    nodeId: z.string(),
    resourceId: z.string(),
    resourceType: z.string(),
    title: z.string(),
    icon: z.string().nullable().optional(),
    kind: z.enum(['node', 'group']),
    renderable: z.boolean(),
    url: z.string().optional(),
    children: z.array(publishedNavigationItemSchema),
  })
);

export const publishedNavigationModelSchema = z.object({
  items: z.array(publishedNavigationItemSchema),
  flatItems: z.array(publishedNavigationItemSchema),
  activeItem: publishedNavigationItemSchema.optional(),
  defaultItem: publishedNavigationItemSchema.optional(),
  isSingleNode: z.boolean(),
  isCurrentNodeInScope: z.boolean(),
});

export const getPublishedAppNavigationModelInputSchema = z.object({
  shareId: z.string(),
  currentNodeId: z.string().optional(),
});

export type IGetPublishedAppNavigationModelRequestDto = z.input<
  typeof getPublishedAppNavigationModelInputSchema
>;

export type IPublishedNavigationModelDto = z.infer<typeof publishedNavigationModelSchema>;

export interface IGetPublishedAppNavigationModelResponseDataDto {
  navigation: IPublishedNavigationModelDto;
}

export type IGetPublishedAppNavigationModelResponseDto =
  IApiResponseDto<IGetPublishedAppNavigationModelResponseDataDto>;
export type IGetPublishedAppNavigationModelOkResponseDto =
  IApiOkResponseDto<IGetPublishedAppNavigationModelResponseDataDto>;
export type IGetPublishedAppNavigationModelErrorResponseDto = IApiErrorResponseDto;

export type IGetPublishedAppNavigationModelEndpointResult =
  | { status: 200; body: IGetPublishedAppNavigationModelOkResponseDto }
  | { status: HttpErrorStatus; body: IGetPublishedAppNavigationModelErrorResponseDto };

export const getPublishedAppNavigationModelResponseDataSchema = z.object({
  navigation: publishedNavigationModelSchema,
});

export const getPublishedAppNavigationModelOkResponseSchema = apiOkResponseDtoSchema(
  getPublishedAppNavigationModelResponseDataSchema
);
export const getPublishedAppNavigationModelErrorResponseSchema = apiErrorResponseDtoSchema;
