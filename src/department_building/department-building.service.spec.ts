import { Test, TestingModule } from '@nestjs/testing';
import { DepartmentBuildingService } from './department-building.service';

describe('DepartmentBuildingService', () => {
  let service: DepartmentBuildingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepartmentBuildingService],
    }).compile();

    service = module.get<DepartmentBuildingService>(DepartmentBuildingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
