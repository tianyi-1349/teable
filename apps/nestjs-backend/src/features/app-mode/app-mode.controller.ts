import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { appModeConfigSchema, type IAppModeConfig } from '@teable/openapi';
import { ZodValidationPipe } from '../../zod.validation.pipe';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { AppModeService } from './app-mode.service';

@Controller('api/base/:baseId/app-mode')
export class AppModeController {
  constructor(private readonly appModeService: AppModeService) {}

  @Get('config')
  @Permissions('base|read')
  getConfig(@Param('baseId') baseId: string): Promise<IAppModeConfig> {
    return this.appModeService.getConfig(baseId);
  }

  @Put('config')
  @Permissions('base|update')
  updateConfig(
    @Param('baseId') baseId: string,
    @Body(new ZodValidationPipe(appModeConfigSchema)) config: IAppModeConfig
  ): Promise<IAppModeConfig> {
    return this.appModeService.updateConfig(baseId, config);
  }
}
