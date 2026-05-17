import { recordSchema, type IRecord } from '@teable/core';
import { shareViewFormSubmitRoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const formSubmitShareViewInputSchema = z
  .object({
    shareId: z.string(),
  })
  .merge(shareViewFormSubmitRoSchema);

export type IFormSubmitShareViewRequestDto = z.input<typeof formSubmitShareViewInputSchema>;

export interface IFormSubmitShareViewResponseDataDto {
  record: IRecord;
}

export type IFormSubmitShareViewResponseDto = IApiResponseDto<IFormSubmitShareViewResponseDataDto>;
export type IFormSubmitShareViewOkResponseDto =
  IApiOkResponseDto<IFormSubmitShareViewResponseDataDto>;
export type IFormSubmitShareViewErrorResponseDto = IApiErrorResponseDto;

export type IFormSubmitShareViewEndpointResult =
  | { status: 201; body: IFormSubmitShareViewOkResponseDto }
  | { status: HttpErrorStatus; body: IFormSubmitShareViewErrorResponseDto };

export const formSubmitShareViewResponseDataSchema = z.object({
  record: recordSchema,
});

export const formSubmitShareViewOkResponseSchema = apiOkResponseDtoSchema(
  formSubmitShareViewResponseDataSchema
);
export const formSubmitShareViewErrorResponseSchema = apiErrorResponseDtoSchema;
