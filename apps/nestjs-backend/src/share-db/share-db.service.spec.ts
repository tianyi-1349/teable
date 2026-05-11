import { HttpErrorCode } from '@teable/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShareDbService } from './share-db.service';

describe('ShareDbService submit permission', () => {
  const createService = () => {
    const clsStore: Record<string, unknown> = {};
    const cls = {
      get: vi.fn((key?: string) => {
        if (!key) {
          return clsStore;
        }
        if (key.includes('.')) {
          return key.split('.').reduce<unknown>((acc, cur) => {
            if (!acc || typeof acc !== 'object') {
              return undefined;
            }
            return (acc as Record<string, unknown>)[cur];
          }, clsStore);
        }
        return clsStore[key];
      }),
      set: vi.fn((key: string, value: unknown) => {
        clsStore[key] = value;
      }),
      runWith: vi.fn(async (store: Record<string, unknown>, callback: () => Promise<unknown>) => {
        const snapshot = { ...clsStore };
        Object.assign(clsStore, store);
        try {
          return await callback();
        } finally {
          Object.keys(clsStore).forEach((k) => delete clsStore[k]);
          Object.assign(clsStore, snapshot);
        }
      }),
    };

    const permissionService = {
      baseShareRequiresPassword: vi.fn().mockResolvedValue(false),
      validateBaseSharePasswordToken: vi.fn().mockResolvedValue(true),
      validBaseSharePermissions: vi.fn().mockResolvedValue([]),
      getTemplateIdByHeader: vi.fn().mockReturnValue('tpl_test'),
      validTemplatePermissions: vi.fn().mockResolvedValue([]),
      validPermissions: vi.fn().mockResolvedValue([]),
    };

    const service = new ShareDbService(
      {} as never,
      { ops2Event: vi.fn() } as never,
      { bindAfterTransaction: vi.fn() } as never,
      cls as never,
      permissionService as never,
      { getCollectionsAttachmentsContext: vi.fn(), repairAttachmentOp: vi.fn() } as never,
      { provider: 'memory', redis: { uri: undefined } } as never,
      { del: vi.fn() } as never,
      {} as never,
      undefined
    );

    return { service, permissionService };
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects submit from share view socket', async () => {
    const { service, permissionService } = createService();
    const context = {
      agent: { custom: { shareId: 'shr_share_view' } },
    } as never;

    await expect(
      (
        service as unknown as {
          validateSubmitPermission: (typeof service)['validateSubmitPermission'];
        }
      ).validateSubmitPermission('tbl_test', context)
    ).rejects.toMatchObject({
      code: HttpErrorCode.RESTRICTED_RESOURCE,
    });
    expect(permissionService.validPermissions).not.toHaveBeenCalled();
  });

  it('rejects base share submit when password cookie token is missing', async () => {
    const { service, permissionService } = createService();
    permissionService.baseShareRequiresPassword.mockResolvedValueOnce(true);

    const context = {
      agent: { custom: { baseShareId: 'shr_base_share', cookie: '' } },
    } as never;

    await expect(
      (
        service as unknown as {
          validateSubmitPermission: (typeof service)['validateSubmitPermission'];
        }
      ).validateSubmitPermission('tbl_test', context)
    ).rejects.toMatchObject({
      code: HttpErrorCode.UNAUTHORIZED_SHARE,
    });
    expect(permissionService.validBaseSharePermissions).not.toHaveBeenCalled();
  });

  it('allows base share submit when password token and permission are valid', async () => {
    const { service, permissionService } = createService();
    permissionService.baseShareRequiresPassword.mockResolvedValueOnce(true);
    permissionService.validateBaseSharePasswordToken.mockResolvedValueOnce(true);

    const context = {
      agent: {
        custom: {
          baseShareId: 'shr_base_share',
          cookie: 'shr_base_share=jwt_token',
          userId: 'usr_test',
        },
      },
    } as never;

    await expect(
      (
        service as unknown as {
          validateSubmitPermission: (typeof service)['validateSubmitPermission'];
        }
      ).validateSubmitPermission('tbl_test', context)
    ).resolves.toBeUndefined();
    expect(permissionService.validBaseSharePermissions).toHaveBeenCalledWith(
      'shr_base_share',
      'tbl_test',
      ['record|update']
    );
  });

  it('rejects normal socket submit without logged-in user', async () => {
    const { service } = createService();
    const context = {
      agent: { custom: {} },
    } as never;

    await expect(
      (
        service as unknown as {
          validateSubmitPermission: (typeof service)['validateSubmitPermission'];
        }
      ).validateSubmitPermission('tbl_test', context)
    ).rejects.toMatchObject({
      code: HttpErrorCode.UNAUTHORIZED,
    });
  });
});
