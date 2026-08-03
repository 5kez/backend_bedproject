import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationTemplate } from './entities/noti-template.entity';
import { CreateNotiTemplateDto } from './dto/create-noti-template.dto';
import { UpdateNotiTemplateDto } from './dto/update-noti-template.dto';

@Injectable()
export class NotiTemplateService {
  constructor(
    @InjectRepository(NotificationTemplate)
    private notiTemplateRepository: Repository<NotificationTemplate>,
  ) {}

  async create(dto: CreateNotiTemplateDto): Promise<NotificationTemplate> {
    const newTemplate = this.notiTemplateRepository.create(dto);
    return this.notiTemplateRepository.save(newTemplate);
  }

  async findAll(): Promise<NotificationTemplate[]> {
    return this.notiTemplateRepository.find();
  }

  async findOne(id: number): Promise<NotificationTemplate> {
    const template = await this.notiTemplateRepository.findOne({
      where: { id },
    });
    if (!template)
      throw new NotFoundException(
        `Notification Template with ID ${id} not found`,
      );
    return template;
  }

  async update(
    id: number,
    dto: UpdateNotiTemplateDto,
  ): Promise<NotificationTemplate> {
    await this.notiTemplateRepository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.notiTemplateRepository.delete(id);
  }
}
