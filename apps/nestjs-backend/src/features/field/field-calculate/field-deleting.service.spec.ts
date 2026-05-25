import { FieldDeletingService } from './field-deleting.service';

describe('FieldDeletingService', () => {
  let service: FieldDeletingService;

  beforeEach(() => {
    service = new FieldDeletingService(
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
