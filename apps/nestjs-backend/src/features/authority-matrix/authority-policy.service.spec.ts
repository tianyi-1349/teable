import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthorityPolicyService } from './authority-policy.service';

describe('AuthorityPolicyService', () => {
  const permissionService = {
    validPermissions: vi.fn(),
  };
  let service: AuthorityPolicyService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuthorityPolicyService(permissionService as never);
  });

  it('uses automation update permission for workflow execution', async () => {
    await service.assertWorkflowExecute('bse123');

    expect(permissionService.validPermissions).toHaveBeenCalledWith('bse123', [
      'automation|update',
    ]);
  });

  it('uses record permissions for record policies', async () => {
    await service.assertRecordRead('tbl123');
    await service.assertRecordCreate('tbl123');
    await service.assertRecordUpdate('tbl123');

    expect(permissionService.validPermissions).toHaveBeenNthCalledWith(1, 'tbl123', [
      'record|read',
    ]);
    expect(permissionService.validPermissions).toHaveBeenNthCalledWith(2, 'tbl123', [
      'record|create',
    ]);
    expect(permissionService.validPermissions).toHaveBeenNthCalledWith(3, 'tbl123', [
      'record|update',
    ]);
  });
});
