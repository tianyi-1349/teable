import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ScriptRuntimeService } from './script-runtime.service';

describe('ScriptRuntimeService', () => {
  let service: ScriptRuntimeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ScriptRuntimeService();
  });

  it('rejects server-side custom script execution', async () => {
    await expect(
      service.execute('return input;', { baseId: 'bse123', input: { recordId: 'rec123' } })
    ).rejects.toThrow(
      'Run Script workflow actions are disabled until a process-isolated sandbox is available'
    );
  });
});
