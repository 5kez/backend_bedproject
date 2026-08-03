import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('users') // 📌 แสดงว่า API นี้อยู่ในหมวด "users"
@ApiBearerAuth() // 📌 ใช้ Authentication แบบ Bearer Token
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' }) // 📌 คำอธิบาย API
  @ApiResponse({ status: 200, description: 'Return all users.' }) // 📌 คำอธิบาย Response
  findAll() {
    return this.usersService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' }) // 📌 คำอธิบาย API
  @ApiParam({ name: 'id', required: true, description: 'User ID' }) // 📌 คำอธิบายพารามิเตอร์
  @ApiResponse({ status: 200, description: 'Return user details.' }) // 📌 คำอธิบาย Response
  findOneById(@Param('id') id: string) {
    return this.usersService.getUserById(Number(id));
  }

  @Get('site/:site_id')
  @ApiOperation({ summary: 'Get users by Site ID' })
  @ApiParam({ name: 'site_id', required: true, description: 'Site ID' })
  @ApiResponse({ status: 200, description: 'Return users details.' })
  AdminFindUsers(@Param('site_id') site_id: string) {
    return this.usersService.getUsersBySite(site_id);
  }

  @Get('staff/:site_id')
  @ApiOperation({ summary: 'Get a user by site_id' }) // 📌 คำอธิบาย API
  @ApiParam({ name: 'site_id', required: true, description: 'User site_id' }) // 📌 คำอธิบายพารามิเตอร์
  @ApiResponse({ status: 200, description: 'Return user details.' }) // 📌 คำอธิบาย Response
  StaffFindUsers(@Param('site_id') site_id: string) {
    return this.usersService.getNurseBySite(site_id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' }) // 📌 คำอธิบาย API
  @ApiResponse({ status: 201, description: 'User successfully created.' }) // 📌 คำอธิบาย Response
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user details' }) // 📌 คำอธิบาย API
  @ApiParam({ name: 'id', required: true, description: 'User ID' }) // 📌 คำอธิบายพารามิเตอร์
  @ApiResponse({
    status: 200,
    description: 'User details updated successfully.',
  }) // 📌 คำอธิบาย Response
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(Number(id), updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' }) // 📌 คำอธิบาย API
  @ApiParam({ name: 'id', required: true, description: 'User ID' }) // 📌 คำอธิบายพารามิเตอร์
  @ApiResponse({ status: 200, description: 'User deleted successfully.' }) // 📌 คำอธิบาย Response
  remove(@Param('id') id: string) {
    return this.usersService.deleteUser(Number(id));
  }

  @Post('migrate-passwords')
  @ApiOperation({
    summary: 'Migrate existing plain text passwords to hashed passwords',
  })
  @ApiResponse({
    status: 200,
    description: 'Password migration completed successfully.',
  })
  migratePasswords() {
    return this.usersService.migrateExistingPasswords();
  }
}
