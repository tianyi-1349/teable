import { Injectable, NotImplementedException } from '@nestjs/common';
import type {
  IGetDepartmentListRo,
  IGetDepartmentListVo,
  IGetDepartmentUserRo,
  IGetDepartmentUserVo,
  IOrganizationMeVo,
} from '@teable/openapi';

const organizationV2PendingMessage =
  'Organization V2 domain is under implementation. Use V2 organization APIs when available.';

@Injectable()
export class OrganizationService {
  async getOrganizationMe(): Promise<IOrganizationMeVo> {
    throw new NotImplementedException(organizationV2PendingMessage);
  }

  async getDepartmentUsers(_query?: IGetDepartmentUserRo): Promise<IGetDepartmentUserVo> {
    throw new NotImplementedException(organizationV2PendingMessage);
  }

  async getDepartmentList(_query?: IGetDepartmentListRo): Promise<IGetDepartmentListVo> {
    throw new NotImplementedException(organizationV2PendingMessage);
  }
}
