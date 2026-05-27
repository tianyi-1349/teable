import { FieldCalculationService } from './field-calculation.service';

describe('FieldCalculationService', () => {
  let service: FieldCalculationService;

  beforeEach(() => {
    service = new FieldCalculationService(
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
