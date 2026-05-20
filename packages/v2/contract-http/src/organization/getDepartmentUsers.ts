import type { IGetDepartmentUserRo, IGetDepartmentUserVo } from '@teable/openapi';
import { getDepartmentUserRoSchema, getDepartmentUserVoSchema } from '@teable/openapi';

import {
  apiErrorResponseDtoSchema,
  apiOkResponseDtoSchema,
  type HttpErrorStatus,
  type IApiErrorResponseDto,
  type IApiOkResponseDto,
  type IApiResponseDto,
} from '../shared/http';

export const getDepartmentUsersInputSchema = getDepartmentUserRoSchema;

export type IGetDepartmentUsersRequestDto = IGetDepartmentUserRo;

export interface IGetDepartmentUsersResponseDataDto {
  users: IGetDepartmentUserVo['users'];
  total: IGetDepartmentUserVo['total'];
}

export type IGetDepartmentUsersResponseDto = IApiResponseDto<IGetDepartmentUsersResponseDataDto>;
export type IGetDepartmentUsersOkResponseDto =
  IApiOkResponseDto<IGetDepartmentUsersResponseDataDto>;
export type IGetDepartmentUsersErrorResponseDto = IApiErrorResponseDto;

export type IGetDepartmentUsersEndpointResult =
  | { status: 200; body: IGetDepartmentUsersOkResponseDto }
  | { status: HttpErrorStatus; body: IGetDepartmentUsersErrorResponseDto };

export const getDepartmentUsersResponseDataSchema = getDepartmentUserVoSchema;

export const getDepartmentUsersOkResponseSchema = apiOkResponseDtoSchema(
  getDepartmentUsersResponseDataSchema
);
export const getDepartmentUsersErrorResponseSchema = apiErrorResponseDtoSchema;

export type IGetDepartmentUsersQueryDto = IGetDepartmentUserRo;
