import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScriptRuntimeService } from './script-runtime.service';

describe('ScriptRuntimeService', () => {
  const aiService = {
    generateText: vi.fn(),
  };
  let service: ScriptRuntimeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ScriptRuntimeService(aiService as never);
  });

  it('executes a script with input and logs', async () => {
    const result = await service.execute(
      'console.log(input.recordId); return { ok: true, input };',
      {
        baseId: 'bse123',
        input: { recordId: 'rec123' },
      }
    );

    expect(result).toEqual({
      result: { ok: true, input: { recordId: 'rec123' } },
      logs: [['rec123']],
    });
  });

  it('can call the AI text helper', async () => {
    aiService.generateText.mockResolvedValue('hello');

    const result = await service.execute('return await ai.generateText("Say hello");', {
      baseId: 'bse123',
      input: {},
    });

    expect(aiService.generateText).toHaveBeenCalledWith('bse123', { prompt: 'Say hello' });
    expect(result).toEqual({ result: 'hello', logs: [] });
  });

  it('wraps script errors', async () => {
    await expect(
      service.execute('throw new Error("boom");', { baseId: 'bse123', input: {} })
    ).rejects.toThrow('Script execution failed: boom');
  });
});
