import { type IButtonClickVo, buttonClickVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const buttonClickShareViewInputSchema = z.object({
  shareId: z.string(),
  recordId: z.string(),
  fieldId: z.string(),
});

export type IButtonClickShareViewRequestDto = z.input<typeof buttonClickShareViewInputSchema>;

export interface IButtonClickShareViewResponseDataDto {
  result: IButtonClickVo;
}

export type IButtonClickShareViewResponseDto =
  IApiResponseDto<IButtonClickShareViewResponseDataDto>;
export type IButtonClickShareViewOkResponseDto =
  IApiOkResponseDto<IButtonClickShareViewResponseDataDto>;
export type IButtonClickShareViewErrorResponseDto = IApiErrorResponseDto;

export type IButtonClickShareViewEndpointResult =
  | { status: 200; body: IButtonClickShareViewOkResponseDto }
  | { status: HttpErrorStatus; body: IButtonClickShareViewErrorResponseDto };

export const buttonClickShareViewResponseDataSchema = z.object({
  result: buttonClickVoSchema,
});

export const buttonClickShareViewOkResponseSchema = apiOkResponseDtoSchema(
  buttonClickShareViewResponseDataSchema
);
export const buttonClickShareViewErrorResponseSchema = apiErrorResponseDtoSchema;
