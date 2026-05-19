import { Injectable } from '@nestjs/common';
import type { IAiGenerateRo } from '@teable/openapi';
import { AiService } from '../ai/ai.service';
import type { IWorkflowAiService } from './workflow-ai.service';

@Injectable()
export class WorkflowAiProvider implements IWorkflowAiService {
  constructor(private readonly aiService: AiService) {}

  generateText(baseId: string, aiGenerateRo: IAiGenerateRo): Promise<string> {
    return this.aiService.generateText(baseId, aiGenerateRo);
  }

  createWorkflowDraft(
    baseId: string,
    prompt: string,
    context?: Record<string, unknown>
  ): Promise<string> {
    const contextText = context ? `\nContext: ${JSON.stringify(context)}` : '';
    return this.aiService.generateText(baseId, {
      prompt: `${prompt}${contextText}`,
    });
  }
}
