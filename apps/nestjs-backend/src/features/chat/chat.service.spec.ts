import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;

  beforeEach(() => {
    service = new ChatService({} as never, {} as never);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
