import { Test, TestingModule } from '@nestjs/testing';
import { SiteService } from './site.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Site } from './entities/site.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';

interface MockRepository {
  create: jest.Mock;
  save: jest.Mock;
  find: jest.Mock;
  findOne: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
}

describe('SiteService', () => {
  let service: SiteService;
  let repo: MockRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteService,
        {
          provide: getRepositoryToken(Site),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SiteService>(SiteService);
    repo = module.get<MockRepository>(getRepositoryToken(Site));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
    const siteEntity = { id: 1, ...dto } as Site;

    repo.create.mockReturnValue(siteEntity);
    repo.save.mockResolvedValue(siteEntity);

    const result = await service.create(dto);
    expect(result).toEqual(siteEntity);
    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.save).toHaveBeenCalledWith(siteEntity);
  });

  it('should return all sites', async () => {
    const sites = [{ id: 1 } as Site];
    repo.find.mockResolvedValue(sites);

    const result = await service.findAll();
    expect(result).toEqual(sites);
    expect(repo.find).toHaveBeenCalled();
  });

  it('should find one site', async () => {
    const site = { id: 1 } as Site;
    repo.findOne.mockResolvedValue(site);

    const result = await service.findOne(1);
    expect(result).toEqual(site);
    expect(repo.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: { buildings: { floors: true } },
    });
  });

  it('should throw NotFoundException if site not found', async () => {
    repo.findOne.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
  });

  it('should update a site', async () => {
    const updateDto: UpdateSiteDto = { sites_name: 'Updated' };
    const updatedSite = { id: 1, sites_name: 'Updated' } as Site;
    repo.update.mockResolvedValue({ affected: 1 });
    repo.findOne.mockResolvedValue(updatedSite);

    const result = await service.update(1, updateDto);
    expect(result).toEqual(updatedSite);
    expect(repo.update).toHaveBeenCalledWith(1, updateDto);
  });

  it('should throw NotFoundException when updating non-existing site', async () => {
    repo.update.mockResolvedValue({ affected: 0 });
    repo.findOne.mockResolvedValue(null);

    await expect(
      service.update(99, { sites_name: 'NotExist' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should remove a site', async () => {
    repo.delete.mockResolvedValue({ affected: 1 });
    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when removing non-existing site', async () => {
    repo.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove(99)).rejects.toThrow(NotFoundException);
  });
});
