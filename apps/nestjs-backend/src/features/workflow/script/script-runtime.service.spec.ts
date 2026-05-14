import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DisabledScriptRuntimeService } from './disabled-script-runtime.service';
import { SCRIPT_RUNTIME_DISABLED_MESSAGE } from './script-runtime.interface';
import { ScriptRuntimeService } from './script-runtime.service';

describe('ScriptRuntimeService', () => {
  let service: ScriptRuntimeService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ScriptRuntimeService(new DisabledScriptRuntimeService());
  });

  it('rejects server-side custom script execution', async () => {
    await expect(
      service.execute('return input;', { baseId: 'bse123', input: { recordId: 'rec123' } })
    ).rejects.toThrow(SCRIPT_RUNTIME_DISABLED_MESSAGE);
  });
});
