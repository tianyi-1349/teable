import { shareViewGetVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getShareViewInputSchema = z.object({
  shareId: z.string(),
});

export type IGetShareViewRequestDto = z.input<typeof getShareViewInputSchema>;

export const getShareViewResponseDataSchema = z.object({
  shareView: shareViewGetVoSchema,
});

export const getShareViewOkResponseSchema = apiOkResponseDtoSchema(getShareViewResponseDataSchema);
export const getShareViewErrorResponseSchema = apiErrorResponseDtoSchema;

export type IGetShareViewResponseDataDto = z.input<typeof getShareViewResponseDataSchema>;
export type IGetShareViewOkResponseDto = z.input<typeof getShareViewOkResponseSchema>;
export type IGetShareViewErrorResponseDto = z.input<typeof getShareViewErrorResponseSchema>;
export type IGetShareViewResponseDto = IApiResponseDto<IGetShareViewResponseDataDto>;

export type IGetShareViewEndpointResult =
  | { status: 200; body: IGetShareViewOkResponseDto }
  | { status: HttpErrorStatus; body: IGetShareViewErrorResponseDto };
