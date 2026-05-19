import { type ITemplatePermalinkVo, templatePermalinkVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getTemplatePermalinkInputSchema = z.object({
  identifier: z.string(),
});

export type IGetTemplatePermalinkRequestDto = z.input<typeof getTemplatePermalinkInputSchema>;

export interface IGetTemplatePermalinkResponseDataDto {
  permalink: ITemplatePermalinkVo;
}

export type IGetTemplatePermalinkResponseDto =
  IApiResponseDto<IGetTemplatePermalinkResponseDataDto>;
export type IGetTemplatePermalinkOkResponseDto =
  IApiOkResponseDto<IGetTemplatePermalinkResponseDataDto>;
export type IGetTemplatePermalinkErrorResponseDto = IApiErrorResponseDto;

export type IGetTemplatePermalinkEndpointResult =
  | { status: 200; body: IGetTemplatePermalinkOkResponseDto }
  | { status: HttpErrorStatus; body: IGetTemplatePermalinkErrorResponseDto };

export const getTemplatePermalinkResponseDataSchema = z.object({
  permalink: templatePermalinkVoSchema,
});

export const getTemplatePermalinkOkResponseSchema = apiOkResponseDtoSchema(
  getTemplatePermalinkResponseDataSchema
);
export const getTemplatePermalinkErrorResponseSchema = apiErrorResponseDtoSchema;
