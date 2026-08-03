import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { HistoryNotificationService } from './history_notification.service';
import { CreateHistoryNotificationDto } from './dto/create-history_notification.dto';

@Controller('history-notification')
export class HistoryNotificationController {
  constructor(
    private readonly historyNotificationService: HistoryNotificationService,
  ) {}

  @Post()
  create(@Body() createHistoryNotificationDto: CreateHistoryNotificationDto) {
    return this.historyNotificationService.create(createHistoryNotificationDto);
  }

  @Get()
  findAll() {
    return this.historyNotificationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historyNotificationService.findOne(+id);
  }

  @Get('site/:site_id')
  findBySiteId(@Param('site_id') site_id: string) {
    return this.historyNotificationService.findBySiteId(Number(site_id));
  }
}
