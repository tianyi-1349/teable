import { AggregationOpenApiService } from './aggregation-open-api.service';

describe('AggregationOpenApiService', () => {
  let service: AggregationOpenApiService;

  beforeEach(() => {
    service = new AggregationOpenApiService({} as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
