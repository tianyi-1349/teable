import {
  type IGetDepartmentListRo,
  type IGetDepartmentListVo,
  getDepartmentListRoSchema,
  getDepartmentListVoSchema,
} from '@teable/openapi';
import { z } from 'zod';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getDepartmentListInputSchema = getDepartmentListRoSchema;

export type IGetDepartmentListRequestDto = z.input<typeof getDepartmentListInputSchema>;

export interface IGetDepartmentListResponseDataDto {
  departments: IGetDepartmentListVo;
}

export type IGetDepartmentListResponseDto = IApiResponseDto<IGetDepartmentListResponseDataDto>;
export type IGetDepartmentListOkResponseDto = IApiOkResponseDto<IGetDepartmentListResponseDataDto>;
export type IGetDepartmentListErrorResponseDto = IApiErrorResponseDto;

export type IGetDepartmentListEndpointResult =
  | { status: 200; body: IGetDepartmentListOkResponseDto }
  | { status: HttpErrorStatus; body: IGetDepartmentListErrorResponseDto };

export const getDepartmentListResponseDataSchema = z.object({
  departments: getDepartmentListVoSchema,
});

export const getDepartmentListOkResponseSchema = apiOkResponseDtoSchema(
  getDepartmentListResponseDataSchema
);
export const getDepartmentListErrorResponseSchema = apiErrorResponseDtoSchema;

export type IGetDepartmentListQueryDto = IGetDepartmentListRo;
