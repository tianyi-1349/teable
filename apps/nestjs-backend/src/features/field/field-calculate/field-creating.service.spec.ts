import { FieldCreatingService } from './field-creating.service';

describe('FieldCreatingService', () => {
  let service: FieldCreatingService;

  beforeEach(() => {
    service = new FieldCreatingService({} as never, {} as never, {} as never, {} as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
