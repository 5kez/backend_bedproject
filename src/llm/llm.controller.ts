import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LlmService } from 'src/llm/llm.service';
import { PatientService } from 'src/patient/patient.service';
import { MqttService } from 'src/mqtt/mqtt.service';

@Controller('llm')
export class LLMController {
  constructor(
    private readonly llmService: LlmService,
    private readonly patientService: PatientService,
    private readonly mqtt: MqttService,
  ) {}

  @Post('summary/:id')
  async getSummary(@Param('id') id: string) {
    const patient = await this.patientService.getPatientByID(+id);
    if (!patient) {
      return { summary: 'ไม่พบข้อมูลผู้ป่วย' };
    }

    const oxygen = this.mqtt.getVital(patient.patient_id, 2);
    const heartRate = this.mqtt.getVital(patient.patient_id, 3);

    const summary = await this.llmService.summarizePatient({
      remark: patient.remark,
      oxygen: oxygen,
      heartRate: heartRate,
    });

    return { summary };
  }

  @Post('message')
  async sendMessageLLM(@Body('message') message: string) {
    const geminiMessage = await this.llmService.sendMessage(message);
    return { geminiMessage };
  }

  @Get('summary')
  getAllSummaries() {
    return { message: 'all patient summaries' };
  }
}
