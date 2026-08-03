import {
  Body,
  Delete,
  Get,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Roles } from './entities/roles.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Roles)
    private readonly roleRepository: Repository<Roles>,
  ) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.roleRepository.create(createRoleDto);
  }

  @Get()
  findAll() {
    return this.roleRepository.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    const pro = await this.roleRepository.findOne({ where: { id: id } });
    if (!pro) throw new NotFoundException(`Floor ${id} not found`);
    return pro;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roleRepository.update(id, updateRoleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number) {
    const role = await this.roleRepository.findOneBy({ id: id });
    if (!role) {
      throw new NotFoundException(`Patient with id ${id} not found`);
    }
  }
}
