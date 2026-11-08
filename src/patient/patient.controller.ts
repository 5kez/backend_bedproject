import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as fs from 'fs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('patient') // 🔹 หมวดหมู่ Patient ใน Swagger
@ApiBearerAuth() // 🔹 ต้องใช้ Authentication
@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get()
  @ApiOperation({ summary: 'Get all patients' })
  @ApiResponse({ status: 200, description: 'List of all patients' })
  async findAll() {
    return await this.patientService.getAllPatient();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient data retrieved' })
  async findOne(@Param('id') id: number) {
    return await this.patientService.getPatientByID(id);
  }

  @Get('site/:site_id')
  @ApiOperation({ summary: 'Get patients by Site ID' })
  @ApiParam({ name: 'site_id', type: Number, description: 'Site ID' })
  @ApiResponse({ status: 200, description: 'Patients data retrieved' })
  async findBySite(@Param('site_id') site_id: number) {
    return await this.patientService.getPatientsBySiteID(site_id);
  }

  @Get('active/case')
  @ApiOperation({ summary: 'Get patients active status' })
  @ApiResponse({ status: 200, description: 'Patients data retrieved' })
  async findAllActive() {
    return await this.patientService.findAllPatientActiveCase();
  }

  // Was ':floor/:floor_id', which also swallowed GET /patient/department/:id
  // (declared later), so department lists came back filtered by floor instead.
  @Get('floor/:floor_id')
  @ApiOperation({ summary: 'Get patients by Floor ID' })
  @ApiParam({ name: 'floor_id', type: Number, description: 'Floor ID' })
  @ApiResponse({ status: 200, description: 'Patients data retrieved' })
  async findByFloor(@Param('floor_id') floor_id: number) {
    return await this.patientService.getPatientsByFloorID(floor_id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  async create(@Body() createPatientDto: CreatePatientDto) {
    return await this.patientService.create(createPatientDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update patient details' })
  @ApiParam({ name: 'id', type: Number, description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  async update(
    @Param('id') id: number,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return await this.patientService.updatePatient(id, updatePatientDto);
  }

  @Get('department/:department_id')
  @ApiOperation({ summary: 'Get patients by department ID' })
  @ApiParam({
    name: 'department_id',
    type: Number,
    description: 'Department ID',
  })
  @ApiResponse({ status: 200, description: 'Patients data retrieved' })
  async findByDepartment(@Param('department_id') department_id: number) {
    console.log('🔥🔥🔥 CONTROLLER CALLED - CODE IS UPDATED! 🔥🔥🔥');
    console.log(
      '🎯 [Controller] findByDepartment called with department_id:',
      department_id,
    );
    const result =
      await this.patientService.getPatientsByDepartment(department_id);
    console.log('🎯 [Controller] returning result with length:', result.length);
    return result;
  }

  @Get('by-building-department/:building_id/:department_id')
  async findByBuildingAndDepartment(
    @Param('building_id') building_id: number,
    @Param('department_id') department_id: number,
  ) {
    return await this.patientService.getPatientsByBuildingAndDepartment(
      building_id,
      department_id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete patient' })
  @ApiParam({ name: 'id', type: Number, description: 'Patient ID' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  async remove(@Param('id') id: number) {
    return await this.patientService.deletePatient(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(), // 🔹 เก็บใน RAM แทนการเขียนลงดิสก์
    }),
  )
  @ApiOperation({ summary: 'Upload patient image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        patientId: { type: 'number', example: 1 },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('patientId') patientId?: number,
  ) {
    if (!file) {
      throw new Error('❌ No file uploaded');
    }

    // 🔹 สร้างชื่อไฟล์ใหม่
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${uniqueSuffix}.${fileExtension}`;

    // 🔹 สร้างโฟลเดอร์ patient ถ้าไม่มี
    const patientDir = './uploads/patient';
    if (!fs.existsSync(patientDir)) {
      fs.mkdirSync(patientDir, { recursive: true });
    }

    // 🔹 เขียนไฟล์จาก memory buffer ลงดิสก์
    const finalFilePath = `/uploads/patient/${filename}`;
    fs.writeFileSync(`./uploads/patient/${filename}`, file.buffer);

    // 🔹 ถ้ามี patientId ให้อัพเดท database ด้วย
    if (patientId) {
      await this.patientService.updatePatientImage(patientId, finalFilePath);
    }

    return { imageUrl: finalFilePath };
  }
}
