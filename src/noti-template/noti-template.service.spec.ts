import { Test, TestingModule } from '@nestjs/testing';
import { NotiTemplateService } from './noti-template.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationTemplate } from './entities/noti-template.entity';
import { Repository } from 'typeorm';

describe('NotiTemplateService', () => {
  let service: NotiTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotiTemplateService,
        {
          provide: getRepositoryToken(NotificationTemplate),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<NotiTemplateService>(NotiTemplateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
