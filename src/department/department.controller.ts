import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
import { Department } from './entities/department.entity';

@ApiTags('departments')
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Post()
  @ApiOperation({
    summary: 'สร้าง Department ใหม่ พร้อม mapping building/floor',
  })
  @ApiResponse({ status: 201, description: 'Created', type: Department })
  create(@Body() dto: CreateDepartmentDto): Promise<Department> {
    return this.departmentService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'ดึง Department ทั้งหมด' })
  @ApiResponse({ status: 200, description: 'Success', type: [Department] })
  findAll(): Promise<Department[]> {
    return this.departmentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดึง Department ตาม ID' })
  @ApiResponse({ status: 200, description: 'Success', type: Department })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Department | null> {
    return this.departmentService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'อัปเดต Department พร้อม mapping building/floor' })
  @ApiResponse({ status: 200, description: 'Updated', type: Department })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDepartmentDto,
  ): Promise<Department | null> {
    return this.departmentService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบ Department พร้อม mapping ทั้งหมด' })
  @ApiResponse({ status: 200, description: 'Deleted' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    try {
      return await this.departmentService.remove(id);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to delete department';
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
