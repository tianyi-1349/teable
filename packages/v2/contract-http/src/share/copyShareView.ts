import { type ICopyVo, type IRangesRo, copyVoSchema, rangesRoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const copyShareViewInputSchema = z
  .object({
    shareId: z.string(),
  })
  .merge(rangesRoSchema.partial());

export type ICopyShareViewRequestDto = z.input<typeof copyShareViewInputSchema>;

export interface ICopyShareViewResponseDataDto {
  copy: ICopyVo;
}

export type ICopyShareViewResponseDto = IApiResponseDto<ICopyShareViewResponseDataDto>;
export type ICopyShareViewOkResponseDto = IApiOkResponseDto<ICopyShareViewResponseDataDto>;
export type ICopyShareViewErrorResponseDto = IApiErrorResponseDto;

export type ICopyShareViewEndpointResult =
  | { status: 200; body: ICopyShareViewOkResponseDto }
  | { status: HttpErrorStatus; body: ICopyShareViewErrorResponseDto };

export const copyShareViewResponseDataSchema = z.object({
  copy: copyVoSchema,
});

export const copyShareViewOkResponseSchema = apiOkResponseDtoSchema(
  copyShareViewResponseDataSchema
);
export const copyShareViewErrorResponseSchema = apiErrorResponseDtoSchema;
