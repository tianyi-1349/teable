import { type ITemplateVo, templateQueryRoSchema, templateVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const listPublishedTemplatesInputSchema = z.object({
  query: templateQueryRoSchema.optional(),
});

export type IListPublishedTemplatesRequestDto = z.input<typeof listPublishedTemplatesInputSchema>;

export interface IListPublishedTemplatesResponseDataDto {
  templates: ITemplateVo[];
}

export type IListPublishedTemplatesResponseDto =
  IApiResponseDto<IListPublishedTemplatesResponseDataDto>;
export type IListPublishedTemplatesOkResponseDto =
  IApiOkResponseDto<IListPublishedTemplatesResponseDataDto>;
export type IListPublishedTemplatesErrorResponseDto = IApiErrorResponseDto;

export type IListPublishedTemplatesEndpointResult =
  | { status: 200; body: IListPublishedTemplatesOkResponseDto }
  | { status: HttpErrorStatus; body: IListPublishedTemplatesErrorResponseDto };

export const listPublishedTemplatesResponseDataSchema = z.object({
  templates: z.array(templateVoSchema),
});

export const listPublishedTemplatesOkResponseSchema = apiOkResponseDtoSchema(
  listPublishedTemplatesResponseDataSchema
);
export const listPublishedTemplatesErrorResponseSchema = apiErrorResponseDtoSchema;
