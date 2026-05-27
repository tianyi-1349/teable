import { GraphService } from './graph.service';

describe('GraphServiceService', () => {
  let service: GraphService;

  beforeEach(() => {
    service = new GraphService(
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
