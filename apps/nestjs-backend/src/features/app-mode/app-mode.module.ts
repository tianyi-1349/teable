import { Module } from '@nestjs/common';
import { AppModeController } from './app-mode.controller';
import { AppModeService } from './app-mode.service';

@Module({
  controllers: [AppModeController],
  providers: [AppModeService],
})
export class AppModeModule {}
