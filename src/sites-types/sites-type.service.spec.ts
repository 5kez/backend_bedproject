import { Test, TestingModule } from '@nestjs/testing';
import { SitesTypeService } from './sites-type.service';

describe('SitesTypeService', () => {
  let service: SitesTypeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SitesTypeService],
    }).compile();

    service = module.get<SitesTypeService>(SitesTypeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
