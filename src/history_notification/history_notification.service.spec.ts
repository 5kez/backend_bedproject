import { Test, TestingModule } from '@nestjs/testing';
import { HistoryNotificationService } from './history_notification.service';

describe('HistoryNotificationService', () => {
  let service: HistoryNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistoryNotificationService],
    }).compile();

    service = module.get<HistoryNotificationService>(
      HistoryNotificationService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
