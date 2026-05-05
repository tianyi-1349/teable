import { describe, it, expect } from 'vitest';
import { getSsrfSafeAgents } from './ssrf-guard';

describe('getSsrfSafeAgents', () => {
  it('should always return both agents (SSRF protection cannot be disabled)', () => {
    const agents = getSsrfSafeAgents();
    expect(agents.httpAgent).toBeDefined();
    expect(agents.httpsAgent).toBeDefined();
  });

  it('should return same cached object', () => {
    expect(getSsrfSafeAgents()).toBe(getSsrfSafeAgents());
  });
});
