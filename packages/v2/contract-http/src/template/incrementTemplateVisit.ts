import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const incrementTemplateVisitInputSchema = z.object({
  templateId: z.string(),
});

export type IIncrementTemplateVisitRequestDto = z.input<typeof incrementTemplateVisitInputSchema>;

export interface IIncrementTemplateVisitResponseDataDto {
  success: true;
}

export type IIncrementTemplateVisitResponseDto =
  IApiResponseDto<IIncrementTemplateVisitResponseDataDto>;
export type IIncrementTemplateVisitOkResponseDto =
  IApiOkResponseDto<IIncrementTemplateVisitResponseDataDto>;
export type IIncrementTemplateVisitErrorResponseDto = IApiErrorResponseDto;

export type IIncrementTemplateVisitEndpointResult =
  | { status: 200; body: IIncrementTemplateVisitOkResponseDto }
  | { status: HttpErrorStatus; body: IIncrementTemplateVisitErrorResponseDto };

export const incrementTemplateVisitResponseDataSchema = z.object({
  success: z.literal(true),
});

export const incrementTemplateVisitOkResponseSchema = apiOkResponseDtoSchema(
  incrementTemplateVisitResponseDataSchema
);
export const incrementTemplateVisitErrorResponseSchema = apiErrorResponseDtoSchema;
