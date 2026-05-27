import { BaseDuplicateService } from './base-duplicate.service';

describe('BaseDuplicateService', () => {
  let service: BaseDuplicateService;

  beforeEach(() => {
    service = new BaseDuplicateService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
