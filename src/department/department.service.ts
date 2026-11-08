import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { DepartmentBuilding } from 'src/department_building/entities/department-building.entity';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(
    @InjectRepository(Department)
    private readonly departmentRepo: Repository<Department>,

    @InjectRepository(DepartmentBuilding)
    private readonly departmentBuildingRepo: Repository<DepartmentBuilding>,
  ) {}

  // สร้าง Department ใหม่ พร้อม mapping
  async create(dto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentRepo.create({
      name: dto.department_name,
    });
    const savedDept = await this.departmentRepo.save(department);

    const mappings = (dto.mappings || []).map((m) =>
      this.departmentBuildingRepo.create({
        department: savedDept,
        building: { id: m.building_id },
        floor_number: m.floor_number ?? null, // ✅ ใช้ floor_number แทน floor_id
      }),
    );

    if (mappings.length > 0) {
      await this.departmentBuildingRepo.save(mappings);
    }

    const dept = await this.findOne(savedDept.id);
    if (!dept) throw new NotFoundException('Department not found after create');
    return dept;
  }

  // ดึง Department ทั้งหมด
  async findAll(): Promise<Department[]> {
    return this.departmentRepo.find({
      relations: [
        'departmentBuildings',
        'departmentBuildings.building',
        'departmentBuildings.floor',
      ],
    });
  }

  // ดึง Department ตาม id
  async findOne(id: number): Promise<Department> {
    const dept = await this.departmentRepo.findOne({
      where: { id },
      relations: [
        'departmentBuildings',
        'departmentBuildings.building',
        'departmentBuildings.floor',
      ],
    });
    if (!dept)
      throw new NotFoundException(`Department with id ${id} not found`);
    return dept;
  }

  // update department พร้อม mapping
  async update(id: number, dto: UpdateDepartmentDto): Promise<Department> {
    const dept = await this.findOne(id); // ตรวจสอบว่ามี dept หรือไม่
    if (dto.department_name) {
      dept.name = dto.department_name;
      await this.departmentRepo.save(dept);
    }
    // clear mapping เดิม
    // Sync the ward mappings instead of deleting and recreating all of them:
    // the old delete-all failed with a foreign-key error as soon as any ward
    // of the department had beds, so a department with beds could not even
    // be renamed.
    const wanted = (dto.mappings || []).map((m) => ({
      building_id: Number(m.building_id),
      floor_number: m.floor_number ?? null,
    }));
    const existing = await this.departmentBuildingRepo.find({
      where: { department_id: id },
      relations: ['beds'],
    });
    const same = (
      a: { building_id: number; floor_number: number | null },
      b: { building_id: number; floor_number: number | null },
    ) =>
      Number(a.building_id) === Number(b.building_id) &&
      (a.floor_number ?? null) === (b.floor_number ?? null);
    for (const ward of existing) {
      if (wanted.some((w) => same(w, ward))) continue;
      if (ward.beds?.length) {
        throw new BadRequestException(
          'ไม่สามารถนำอาคาร/ชั้นนี้ออกได้ เนื่องจากยังมีเตียงอยู่ในแผนก กรุณาย้ายหรือลบเตียงก่อน',
        );
      }
      await this.departmentBuildingRepo.delete(ward.id);
    }
    const mappings = wanted
      .filter((w) => !existing.some((ward) => same(w, ward)))
      .map((m) =>
        this.departmentBuildingRepo.create({
          department: dept,
          building: { id: m.building_id },
          floor_number: m.floor_number,
        }),
      );

    if (mappings.length > 0) {
      await this.departmentBuildingRepo.save(mappings);
    }

    this.logger.debug(
      `Updating department ${id} with data: ${JSON.stringify(dto)}`,
    );
    return this.findOne(id);
  }

  // ลบ Department พร้อม mapping
  async remove(id: number): Promise<void> {
    try {
      await this.departmentBuildingRepo.delete({ department: { id } });
      await this.departmentRepo.delete(id);
    } catch (error) {
      // Check if it's a foreign key constraint error
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'ER_ROW_IS_REFERENCED_2'
      ) {
        throw new Error(
          'ไม่สามารถลบแผนกนี้ได้ เนื่องจากมีผู้ใช้งานที่เชื่อมโยงอยู่ กรุณาลบหรือย้ายผู้ใช้งานออกจากแผนกนี้ก่อน',
        );
      }
      throw error;
    }
  }
}
