import { copyVoSchema, rangesRoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiResponseDto,
} from '../shared/http';

export const copyShareViewInputSchema = z
  .object({
    shareId: z.string(),
  })
  .merge(rangesRoSchema.partial());

export type ICopyShareViewRequestDto = z.input<typeof copyShareViewInputSchema>;

export const copyShareViewResponseDataSchema = z.object({
  copy: copyVoSchema,
});

export const copyShareViewOkResponseSchema = apiOkResponseDtoSchema(
  copyShareViewResponseDataSchema
);
export const copyShareViewErrorResponseSchema = apiErrorResponseDtoSchema;

export type ICopyShareViewResponseDataDto = z.input<typeof copyShareViewResponseDataSchema>;
export type ICopyShareViewOkResponseDto = z.input<typeof copyShareViewOkResponseSchema>;
export type ICopyShareViewErrorResponseDto = z.input<typeof copyShareViewErrorResponseSchema>;
export type ICopyShareViewResponseDto = IApiResponseDto<ICopyShareViewResponseDataDto>;

export type ICopyShareViewEndpointResult =
  | { status: 200; body: ICopyShareViewOkResponseDto }
  | { status: HttpErrorStatus; body: ICopyShareViewErrorResponseDto };
