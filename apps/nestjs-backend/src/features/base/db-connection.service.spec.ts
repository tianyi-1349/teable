import { DbConnectionService } from './db-connection.service';

describe('DbConnectionService', () => {
  let service: DbConnectionService;

  beforeEach(() => {
    service = new DbConnectionService(
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
