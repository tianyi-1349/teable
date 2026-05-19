import { type ISettingVo, settingVoSchema } from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getSettingInputSchema = z.object({});

export type IGetSettingRequestDto = z.input<typeof getSettingInputSchema>;

export interface IGetSettingResponseDataDto {
  setting: ISettingVo;
}

export type IGetSettingResponseDto = IApiResponseDto<IGetSettingResponseDataDto>;
export type IGetSettingOkResponseDto = IApiOkResponseDto<IGetSettingResponseDataDto>;
export type IGetSettingErrorResponseDto = IApiErrorResponseDto;

export type IGetSettingEndpointResult =
  | { status: 200; body: IGetSettingOkResponseDto }
  | { status: HttpErrorStatus; body: IGetSettingErrorResponseDto };

export const getSettingResponseDataSchema = z.object({
  setting: settingVoSchema,
});

export const getSettingOkResponseSchema = apiOkResponseDtoSchema(getSettingResponseDataSchema);
export const getSettingErrorResponseSchema = apiErrorResponseDtoSchema;
