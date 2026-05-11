import { Injectable } from '@nestjs/common';
import type { IAiGenerateRo } from '@teable/openapi';
// @ts-expect-error vm2 does not ship declarations in this workspace.
import { VM } from 'vm2';
import { WorkflowAiService } from '../workflow-ai.service';

interface IScriptContext {
  baseId: string;
  input: unknown;
}

@Injectable()
export class ScriptRuntimeService {
  constructor(private readonly workflowAiService: WorkflowAiService) {}

  async execute(script: string, context: IScriptContext): Promise<unknown> {
    const logs: unknown[][] = [];
    const vm = new VM({
      timeout: 30_000,
      eval: false,
      wasm: false,
      sandbox: {
        input: context.input,
        console: {
          log: (...args: unknown[]) => logs.push(args),
        },
        JSON,
        ai: {
          generateText: (prompt: string, options?: Omit<IAiGenerateRo, 'prompt'>) =>
            this.workflowAiService.generateText(context.baseId, {
              ...options,
              prompt,
            } as IAiGenerateRo),
        },
      },
    });

    try {
      const result = await vm.run(`(async () => {\n${script}\n})()`);
      return { result, logs };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Script execution failed: ${message}`);
    }
  }
}
