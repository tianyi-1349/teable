import { type IPublicSettingVo, publicSettingVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getPublicSettingInputSchema = z.object({});

export type IGetPublicSettingRequestDto = z.input<typeof getPublicSettingInputSchema>;

export interface IGetPublicSettingResponseDataDto {
  setting: IPublicSettingVo;
}

export type IGetPublicSettingResponseDto = IApiResponseDto<IGetPublicSettingResponseDataDto>;
export type IGetPublicSettingOkResponseDto = IApiOkResponseDto<IGetPublicSettingResponseDataDto>;
export type IGetPublicSettingErrorResponseDto = IApiErrorResponseDto;

export type IGetPublicSettingEndpointResult =
  | { status: 200; body: IGetPublicSettingOkResponseDto }
  | { status: HttpErrorStatus; body: IGetPublicSettingErrorResponseDto };

export const getPublicSettingResponseDataSchema = z.object({
  setting: publicSettingVoSchema,
});

export const getPublicSettingOkResponseSchema = apiOkResponseDtoSchema(
  getPublicSettingResponseDataSchema
);
export const getPublicSettingErrorResponseSchema = apiErrorResponseDtoSchema;
