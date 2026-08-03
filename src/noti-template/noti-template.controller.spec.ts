import { Test, TestingModule } from '@nestjs/testing';
import { NotiTemplateController } from './noti-template.controller';
import { NotiTemplateService } from './noti-template.service';

describe('NotiTemplateController', () => {
  let controller: NotiTemplateController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotiTemplateController],
      providers: [NotiTemplateService],
    }).compile();

    controller = module.get<NotiTemplateController>(NotiTemplateController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
