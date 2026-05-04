import { Injectable } from '@nestjs/common';
import { appModeConfigSchema, type IAppModeConfig } from '@teable/openapi';
import { PrismaService } from '@teable/db-main-prisma';
import { ClsService } from 'nestjs-cls';
import type { IClsStore } from '../../types/cls';

@Injectable()
export class AppModeService {
  private static readonly APP_MODE_SETTING_PREFIX = 'app-mode:base:';

  constructor(
    private readonly prismaService: PrismaService,
    private readonly cls: ClsService<IClsStore>
  ) {}

  private get userId() {
    return this.cls.get('user.id') ?? 'system';
  }

  private getSettingName(baseId: string) {
    return `${AppModeService.APP_MODE_SETTING_PREFIX}${baseId}`;
  }

  private defaultConfig(): IAppModeConfig {
    return appModeConfigSchema.parse({});
  }

  private parseConfig(content?: string | null): IAppModeConfig {
    if (!content) {
      return this.defaultConfig();
    }

    try {
      return appModeConfigSchema.parse(JSON.parse(content));
    } catch {
      return this.defaultConfig();
    }
  }

  private async ensureBaseExists(baseId: string) {
    await this.prismaService.base.findUniqueOrThrow({
      where: { id: baseId, deletedTime: null },
      select: { id: true },
    });
  }

  async getConfig(baseId: string): Promise<IAppModeConfig> {
    await this.ensureBaseExists(baseId);
    const setting = await this.prismaService.setting.findUnique({
      where: { name: this.getSettingName(baseId) },
      select: { content: true },
    });

    return this.parseConfig(setting?.content);
  }

  async updateConfig(baseId: string, config: IAppModeConfig): Promise<IAppModeConfig> {
    await this.ensureBaseExists(baseId);
    const normalized = appModeConfigSchema.parse(config);

    await this.prismaService.setting.upsert({
      where: { name: this.getSettingName(baseId) },
      create: {
        name: this.getSettingName(baseId),
        content: JSON.stringify(normalized),
        createdBy: this.userId,
      },
      update: {
        content: JSON.stringify(normalized),
        lastModifiedBy: this.userId,
      },
    });

    return normalized;
  }
}
