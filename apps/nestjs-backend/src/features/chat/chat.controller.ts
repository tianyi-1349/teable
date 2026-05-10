import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ChatService } from './chat.service';

/**
 * @deprecated Use AiChatController (api/:baseId/ai/chat) instead.
 * This legacy endpoint has no resource-level permission scoping.
 * Keep new integrations on the base-scoped route so PermissionGuard can enforce base|read.
 */
@Controller('api/chart')
export class ChatController {
  constructor(private readonly chartService: ChatService) {}

  @Post('completions')
  async completions(@Req() req: Request, @Res() res: Response) {
    await this.chartService.completions(req, res);
  }
}
