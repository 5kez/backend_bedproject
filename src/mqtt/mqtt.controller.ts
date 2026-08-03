import { Controller, Get } from '@nestjs/common';
import { MqttService } from './mqtt.service';

@Controller('mqtt')
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @Get('status')
  getStatus() {
    return this.mqttService.getConnectionInfo();
  }

  @Get('reload')
  async reloadSubscriptions() {
    await this.mqttService.reloadSensorSubscriptions();
    return { message: 'Sensor subscriptions reloaded' };
  }
}
