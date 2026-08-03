import { PartialType } from '@nestjs/swagger';
import { CreateHistoryNotificationDto } from './create-history_notification.dto';

export class UpdateHistoryNotificationDto extends PartialType(
  CreateHistoryNotificationDto,
) {}
