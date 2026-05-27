import { BatchService } from './batch.service';

describe('BatchService', () => {
  let service: BatchService;

  beforeEach(() => {
    service = new BatchService(
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
