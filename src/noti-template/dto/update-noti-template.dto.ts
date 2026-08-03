import { PartialType } from '@nestjs/mapped-types';
import { CreateNotiTemplateDto } from './create-noti-template.dto';

export class UpdateNotiTemplateDto extends PartialType(CreateNotiTemplateDto) {}
