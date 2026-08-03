import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProvinceService } from './province.service';
import { CreateProvinceDto } from './dto/create-province.dto';
import { UpdateProvinceDto } from './dto/update-province.dto';

@Controller('provinces')
export class ProvinceController {
  constructor(private readonly provinceService: ProvinceService) {}

  @Post()
  create(@Body() dto: CreateProvinceDto) {
    return this.provinceService.create(dto);
  }

  @Get()
  findAll() {
    return this.provinceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.provinceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProvinceDto) {
    return this.provinceService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.provinceService.remove(+id);
  }
}
