import { Test, TestingModule } from '@nestjs/testing';
import { SitesTypeController } from './sites-type.controller';
import { SitesTypeService } from './sites-type.service';

describe('SitesTypeController', () => {
  let controller: SitesTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SitesTypeController],
      providers: [SitesTypeService],
    }).compile();

    controller = module.get<SitesTypeController>(SitesTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
