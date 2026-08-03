// src/llm/llm.module.ts
import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { LLMController } from './llm.controller';
import { PatientModule } from '../patient/patient.module';
import { MqttModule } from '../mqtt/mqtt.module';

@Module({
  imports: [PatientModule, MqttModule],
  providers: [LlmService],
  controllers: [LLMController],
  exports: [LlmService],
})
export class LlmModule {}
