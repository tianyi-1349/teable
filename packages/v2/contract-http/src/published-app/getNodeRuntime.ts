import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';
import { publishedAppRuntimeNodeSchema } from './getRuntimeManifest';

export const publishedAppNodeRuntimeSchema = z.object({
  requestedNodeId: z.string(),
  currentNode: publishedAppRuntimeNodeSchema.optional(),
  defaultNode: publishedAppRuntimeNodeSchema.nullable(),
  resolvedNode: publishedAppRuntimeNodeSchema.nullable(),
  isCurrentNodeInScope: z.boolean(),
  isRenderable: z.boolean(),
  isDefault: z.boolean(),
  url: z.string().optional(),
});

export const getPublishedAppNodeRuntimeInputSchema = z.object({
  shareId: z.string(),
  nodeId: z.string(),
});

export type IGetPublishedAppNodeRuntimeRequestDto = z.input<
  typeof getPublishedAppNodeRuntimeInputSchema
>;
export type IPublishedAppNodeRuntimeDto = z.infer<typeof publishedAppNodeRuntimeSchema>;

export interface IGetPublishedAppNodeRuntimeResponseDataDto {
  runtime: IPublishedAppNodeRuntimeDto;
}

export type IGetPublishedAppNodeRuntimeResponseDto =
  IApiResponseDto<IGetPublishedAppNodeRuntimeResponseDataDto>;
export type IGetPublishedAppNodeRuntimeOkResponseDto =
  IApiOkResponseDto<IGetPublishedAppNodeRuntimeResponseDataDto>;
export type IGetPublishedAppNodeRuntimeErrorResponseDto = IApiErrorResponseDto;

export type IGetPublishedAppNodeRuntimeEndpointResult =
  | { status: 200; body: IGetPublishedAppNodeRuntimeOkResponseDto }
  | { status: HttpErrorStatus; body: IGetPublishedAppNodeRuntimeErrorResponseDto };

export const getPublishedAppNodeRuntimeResponseDataSchema = z.object({
  runtime: publishedAppNodeRuntimeSchema,
});

export const getPublishedAppNodeRuntimeOkResponseSchema = apiOkResponseDtoSchema(
  getPublishedAppNodeRuntimeResponseDataSchema
);
export const getPublishedAppNodeRuntimeErrorResponseSchema = apiErrorResponseDtoSchema;
