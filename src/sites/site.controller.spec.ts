import { Test, TestingModule } from '@nestjs/testing';
import { SiteController } from './site.controller';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

describe('SiteController', () => {
  let controller: SiteController;

  const mockSiteService = {
    create: jest.fn((dto: CreateSiteDto) => Promise.resolve({ id: 1, ...dto })),
    findAll: jest.fn(() => Promise.resolve([])),
    findOne: jest.fn((id: number) => Promise.resolve({ id })),
    update: jest.fn((id: number, dto: UpdateSiteDto) =>
      Promise.resolve({ id, ...dto }),
    ),
    remove: jest.fn(() => Promise.resolve(undefined)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SiteController],
      providers: [
        {
          provide: SiteService,
          useValue: mockSiteService,
        },
      ],
    }).compile();

    controller = module.get<SiteController>(SiteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a site', async () => {
    const dto: CreateSiteDto = {
      sites_name: 'Test Site',
      lat: 13.123456,
      lng: 100.123456,
      address: '123 Main St',
      sites_type_id: 1,
      prov_id: 1,
      site_global: 1,
    };
    await expect(controller.create(dto)).resolves.toEqual({ id: 1, ...dto });
    expect(mockSiteService.create).toHaveBeenCalledWith(dto);
  });

  it('should return all sites', async () => {
    await expect(controller.findAll()).resolves.toEqual([]);
    expect(mockSiteService.findAll).toHaveBeenCalled();
  });

  it('should get one site', async () => {
    await expect(controller.findOne(1)).resolves.toEqual({ id: 1 });
    expect(mockSiteService.findOne).toHaveBeenCalledWith(1);
  });

  it('should update a site', async () => {
    const dto: UpdateSiteDto = { sites_name: 'Updated Site' };
    await expect(controller.update(1, dto)).resolves.toEqual({ id: 1, ...dto });
    expect(mockSiteService.update).toHaveBeenCalledWith(1, dto);
  });

  it('should remove a site', async () => {
    await expect(controller.remove(1)).resolves.toBeUndefined();
    expect(mockSiteService.remove).toHaveBeenCalledWith(1);
  });
});
