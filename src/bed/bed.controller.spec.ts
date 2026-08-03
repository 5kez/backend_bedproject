import { Test, TestingModule } from '@nestjs/testing';
import { BedController } from './bed.controller';
import { BedService } from './bed.service';

describe('BedController', () => {
  let controller: BedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BedController],
      providers: [BedService],
    }).compile();

    controller = module.get<BedController>(BedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
