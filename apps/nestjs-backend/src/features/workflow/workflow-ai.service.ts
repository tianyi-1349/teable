import { Inject, Injectable } from '@nestjs/common';
import type { IAiGenerateRo } from '@teable/openapi';

export const WORKFLOW_AI_PROVIDER = Symbol('WORKFLOW_AI_PROVIDER');

export interface IWorkflowAiService {
  generateText(baseId: string, aiGenerateRo: IAiGenerateRo): Promise<string>;
}

@Injectable()
export class WorkflowAiService implements IWorkflowAiService {
  constructor(@Inject(WORKFLOW_AI_PROVIDER) private readonly aiProvider: IWorkflowAiService) {}

  async generateText(baseId: string, aiGenerateRo: IAiGenerateRo): Promise<string> {
    return this.aiProvider.generateText(baseId, aiGenerateRo);
  }
}
