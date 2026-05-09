import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from '../ai/ai.module';
import { RecordOpenApiModule } from '../record/open-api/record-open-api.module';
import { RecordModule } from '../record/record.module';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { AiChatToolsService } from './ai-chat-tools.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [ConfigModule, AiModule, RecordModule, RecordOpenApiModule],
  providers: [ChatService, AiChatService, AiChatToolsService],
  controllers: [ChatController, AiChatController],
  exports: [ChatService, AiChatService],
})
export class ChatModule {}
