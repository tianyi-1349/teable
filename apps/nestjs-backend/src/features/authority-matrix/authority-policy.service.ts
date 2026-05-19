import { Injectable } from '@nestjs/common';
import type { Action } from '@teable/core';
import { PermissionService } from '../auth/permission.service';

@Injectable()
export class AuthorityPolicyService {
  constructor(private readonly permissionService: PermissionService) {}

  async assertWorkflowExecute(baseId: string) {
    await this.assertPermissions(baseId, ['automation|update']);
  }

  async assertRecordRead(tableId: string) {
    await this.assertPermissions(tableId, ['record|read']);
  }

  async assertRecordCreate(tableId: string) {
    await this.assertPermissions(tableId, ['record|create']);
  }

  async assertRecordUpdate(tableId: string) {
    await this.assertPermissions(tableId, ['record|update']);
  }

  private async assertPermissions(resourceId: string, permissions: Action[]) {
    await this.permissionService.validPermissions(resourceId, permissions);
  }
}
