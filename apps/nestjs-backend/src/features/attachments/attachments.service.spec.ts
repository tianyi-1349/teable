import { AttachmentsService } from './attachments.service';

describe('AttachmentsService', () => {
  let service: AttachmentsService;

  beforeEach(() => {
    service = new AttachmentsService(
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
