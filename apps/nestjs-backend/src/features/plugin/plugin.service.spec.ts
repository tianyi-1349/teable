import { PluginService } from './plugin.service';

describe('PluginService', () => {
  let service: PluginService;

  beforeEach(() => {
    service = new PluginService({} as never, {} as never, {} as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
