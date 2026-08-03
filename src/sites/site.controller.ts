import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { SiteService } from './site.service';
import { CreateSiteDto } from './dto/create-site.dto';
import { UpdateSiteDto } from './dto/update-site.dto';
import { Site } from './entities/site.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import * as fs from 'fs';

@ApiTags('sites')
@Controller('sites')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new site' })
  @ApiResponse({
    status: 201,
    description: 'Site created successfully.',
    type: Site,
  })
  create(@Body() createSiteDto: CreateSiteDto): Promise<Site> {
    return this.siteService.create(createSiteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all sites' })
  @ApiResponse({ status: 200, description: 'List of sites.', type: [Site] })
  findAll(): Promise<Site[]> {
    return this.siteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a site by id' })
  @ApiParam({ name: 'id', description: 'Site ID', type: Number })
  @ApiResponse({ status: 200, description: 'Site details.', type: Site })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Site> {
    return this.siteService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a site by id' })
  @ApiParam({ name: 'id', description: 'Site ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Site updated successfully.',
    type: Site,
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSiteDto: UpdateSiteDto,
  ): Promise<Site> {
    return this.siteService.update(id, updateSiteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a site by id' })
  @ApiParam({ name: 'id', description: 'Site ID', type: Number })
  @ApiResponse({ status: 204, description: 'Site deleted successfully.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // ✅ เพิ่ม Promise<void>
    return this.siteService.remove(id);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  @ApiOperation({ summary: 'Upload sensor image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        statusId: { type: 'number', example: 1 },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('siteId') siteId?: number,
  ) {
    if (!file) {
      throw new Error('❌ No file uploaded');
    }

    // 🔹 สร้างชื่อไฟล์ใหม่
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split('.').pop();
    const filename = `${uniqueSuffix}.${fileExtension}`;

    // 🔹 สร้างโฟลเดอร์ site ถ้าไม่มี
    const siteDir = './uploads/site';
    if (!fs.existsSync(siteDir)) {
      fs.mkdirSync(siteDir, { recursive: true });
    }

    // 🔹 เขียนไฟล์จาก memory buffer ลงดิสก์
    const finalFilePath = `/uploads/site/${filename}`;
    fs.writeFileSync(`./uploads/site/${filename}`, file.buffer);

    // 🔹 ถ้ามี statusId ให้อัพเดท database ด้วย
    if (siteId) {
      await this.siteService.updateSiteImage(siteId, finalFilePath);
    }

    return { imageUrl: finalFilePath };
  }
}
