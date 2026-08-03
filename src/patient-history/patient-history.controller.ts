import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { PatientHistoryService } from './patient-history.service';
import { CreatePatientHistoryDto } from './dto/create-patient-history.dto';
import { UpdatePatientHistoryDto } from './dto/update-patient-history.dto';
import { ApiBearerAuth } from '@nestjs/swagger/dist/decorators/api-bearer.decorator';

@ApiBearerAuth() // 📌 ใช้ Authentication แบบ Bearer Token
@Controller('patient-history')
export class PatientHistoryController {
  constructor(private readonly patienthistoryService: PatientHistoryService) {}

  @Post()
  create(@Body() dto: CreatePatientHistoryDto) {
    return this.patienthistoryService.create(dto);
  }
  @Get()
  findAll() {
    return this.patienthistoryService.findAll();
  }

  @Get('active-case')
  findActiveCase() {
    return this.patienthistoryService.findActiveCase();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patienthistoryService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePatientHistoryDto) {
    return this.patienthistoryService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patienthistoryService.remove(+id);
  }
}
