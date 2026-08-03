import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentBuildingController } from './department-building.controller';
import { DepartmentBuildingService } from './department-building.service';

describe('DepartmentBuildingController', () => {
  let controller: DepartmentBuildingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepartmentBuildingController],
      providers: [DepartmentBuildingService],
    }).compile();

    controller = module.get<DepartmentBuildingController>(
      DepartmentBuildingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
