import { templateVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getTemplateByIdInputSchema = z.object({
  templateId: z.string(),
});

export type IGetTemplateByIdRequestDto = z.input<typeof getTemplateByIdInputSchema>;

export const getTemplateByIdResponseDataSchema = z.object({
  template: templateVoSchema,
});

export const getTemplateByIdOkResponseSchema = apiOkResponseDtoSchema(
  getTemplateByIdResponseDataSchema
);
export const getTemplateByIdErrorResponseSchema = apiErrorResponseDtoSchema;

export type IGetTemplateByIdResponseDataDto = z.infer<typeof getTemplateByIdResponseDataSchema>;
export type IGetTemplateByIdOkResponseDto = z.infer<typeof getTemplateByIdOkResponseSchema>;
export type IGetTemplateByIdErrorResponseDto = z.infer<typeof getTemplateByIdErrorResponseSchema>;
export type IGetTemplateByIdResponseDto = IApiResponseDto<IGetTemplateByIdResponseDataDto>;

export type IGetTemplateByIdEndpointResult =
  | { status: 200; body: IGetTemplateByIdOkResponseDto }
  | { status: HttpErrorStatus; body: IGetTemplateByIdErrorResponseDto };
