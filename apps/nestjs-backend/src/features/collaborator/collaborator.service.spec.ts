import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Role, getPermissions } from '@teable/core';
import { PrismaService } from '@teable/db-main-prisma';
import { CollaboratorType, PrincipalType } from '@teable/openapi';
import type { Knex } from 'knex';
import { ClsService } from 'nestjs-cls';
import { mockDeep } from 'vitest-mock-extended';
import { DB_PROVIDER_SYMBOL } from '../../db-provider/db.provider';
import type { IDbProvider } from '../../db-provider/db.provider.interface';
import { EventEmitterService } from '../../event-emitter/event-emitter.service';
import type { IClsStore } from '../../types/cls';
import { CollaboratorService } from './collaborator.service';

describe('CollaboratorService', () => {
  const mockUser = { id: 'usr1', name: 'John', email: 'john@example.com' };
  const mockSpace = { id: 'spcxxxxxxxx', name: 'Test Space' };
  const prismaService = mockDeep<PrismaService>();
  const clsService = {
    get: vitest.fn(),
    runWith: vitest.fn(async (store: IClsStore, fn: () => Promise<unknown>) => {
      clsService.get.mockImplementation((key: string) => {
        if (key === 'user.id') {
          return store.user?.id;
        }
        return undefined;
      });
      return await fn();
    }),
  };
  const eventEmitterService = {
    emitAsync: vitest.fn(),
  };
  const knex = {} as Knex;
  const dbProvider = mockDeep<IDbProvider>();

  let collaboratorService: CollaboratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollaboratorService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: ClsService,
          useValue: clsService,
        },
        {
          provide: EventEmitterService,
          useValue: eventEmitterService,
        },
        {
          provide: 'CUSTOM_KNEX',
          useValue: knex,
        },
        {
          provide: DB_PROVIDER_SYMBOL,
          useValue: dbProvider,
        },
      ],
    }).compile();

    collaboratorService = module.get<CollaboratorService>(CollaboratorService);

    clsService.get.mockReset();
    clsService.runWith.mockClear();
    eventEmitterService.emitAsync.mockReset();

    prismaService.txClient.mockImplementation(() => {
      return prismaService;
    });

    prismaService.$tx.mockImplementation(async (fn, _options) => {
      return await fn(prismaService);
    });
  });

  describe('createSpaceCollaborator', () => {
    it('should create collaborator correctly', async () => {
      prismaService.collaborator.count.mockResolvedValue(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      prismaService.base.findMany.mockResolvedValue([{ id: 'base1' }] as any);
      prismaService.collaborator.deleteMany.mockResolvedValue({ count: 0 });
      await clsService.runWith(
        {
          user: mockUser,
          tx: {},
          permissions: getPermissions(Role.Owner),
          origin: {
            ip: '127.0.0.1',
            byApi: false,
            userAgent: 'test',
            referer: 'test',
          },
        },
        async () => {
          await collaboratorService.createSpaceCollaborator({
            collaborators: [
              {
                principalId: mockUser.id,
                principalType: PrincipalType.User,
              },
            ],
            role: Role.Owner,
            spaceId: mockSpace.id,
          });
        }
      );

      expect(prismaService.collaborator.deleteMany).toBeCalledWith({
        where: {
          OR: [
            {
              principalId: mockUser.id,
              principalType: PrincipalType.User,
            },
          ],
          resourceId: { in: ['base1'] },
          resourceType: CollaboratorType.Base,
        },
      });
      expect(prismaService.collaborator.createMany).toBeCalled();
    });

    it('should throw error if exists', async () => {
      prismaService.collaborator.count.mockResolvedValue(1);

      await expect(
        collaboratorService.createSpaceCollaborator({
          collaborators: [
            {
              principalId: mockUser.id,
              principalType: PrincipalType.User,
            },
          ],
          role: Role.Owner,
          spaceId: mockSpace.id,
        })
      ).rejects.toThrow('Collaborator has already existed in space');
    });
  });
});
