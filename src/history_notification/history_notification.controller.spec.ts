import { Test, TestingModule } from '@nestjs/testing';
import { HistoryNotificationController } from './history_notification.controller';
import { HistoryNotificationService } from './history_notification.service';

describe('HistoryNotificationController', () => {
  let controller: HistoryNotificationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoryNotificationController],
      providers: [HistoryNotificationService],
    }).compile();

    controller = module.get<HistoryNotificationController>(
      HistoryNotificationController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
