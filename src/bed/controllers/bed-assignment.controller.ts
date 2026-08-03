import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { BedAssignmentService } from '../services/bed-assignment.service';
import {
  CreateBedAssignmentDto,
  UpdateBedAssignmentDto,
  TransferPatientDto,
} from '../dto/bed-assignment.dto';

@Controller('bed-assignments')
export class BedAssignmentController {
  constructor(private readonly bedAssignmentService: BedAssignmentService) {}

  @Post()
  create(@Body() createBedAssignmentDto: CreateBedAssignmentDto) {
    return this.bedAssignmentService.create(createBedAssignmentDto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    if (status === 'active') {
      return this.bedAssignmentService.findActive();
    }
    return this.bedAssignmentService.findAll();
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId', ParseIntPipe) patientId: number) {
    return this.bedAssignmentService.findByPatient(patientId);
  }

  @Get('bed/:bedId')
  findByBed(@Param('bedId', ParseIntPipe) bedId: number) {
    return this.bedAssignmentService.findByBed(bedId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBedAssignmentDto: UpdateBedAssignmentDto,
  ) {
    return this.bedAssignmentService.update(id, updateBedAssignmentDto);
  }

  @Post(':id/transfer')
  transfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() transferDto: TransferPatientDto,
  ) {
    return this.bedAssignmentService.transferPatient(id, transferDto);
  }

  @Post(':id/discharge')
  discharge(
    @Param('id', ParseIntPipe) id: number,
    @Body('discharged_by') dischargedBy: number,
  ) {
    return this.bedAssignmentService.discharge(id, dischargedBy);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bedAssignmentService.remove(id);
  }
}
