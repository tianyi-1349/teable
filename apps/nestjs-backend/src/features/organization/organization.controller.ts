import { Controller, Get, Query } from '@nestjs/common';
import type {
  IGetDepartmentListRo,
  IGetDepartmentListVo,
  IGetDepartmentUserRo,
  IGetDepartmentUserVo,
  IOrganizationMeVo,
} from '@teable/openapi';
import { OrganizationService } from './organization.service';

@Controller('api/organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get('me')
  async getOrganizationMe(): Promise<IOrganizationMeVo> {
    return this.organizationService.getOrganizationMe();
  }

  @Get('department-user')
  async getDepartmentUsers(@Query() query: IGetDepartmentUserRo): Promise<IGetDepartmentUserVo> {
    return this.organizationService.getDepartmentUsers(query);
  }

  @Get('department')
  async getDepartmentList(@Query() query: IGetDepartmentListRo): Promise<IGetDepartmentListVo> {
    return this.organizationService.getDepartmentList(query);
  }
}
