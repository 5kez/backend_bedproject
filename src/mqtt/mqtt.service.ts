import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';
import { Sensor } from '../sensor/entities/sensor.entity';
import { Patient } from '../patient/entities/patient.entity';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';

const PREFIX: Record<number, string> = {
  1: 'posture',
  3: 'spo2',
  2: 'heartrate',
};
type Update = (patient_id: number, sensorTypeId: number, value: number) => void;

@Injectable()
export class MqttService implements OnModuleInit {
  private readonly logger = new Logger(MqttService.name);
  private client!: mqtt.MqttClient;
  private readonly vitalMap = new Map<number, Map<number, number>>();
  private readonly binding = new Map<
    string,
    { pid: number; sid: number; topic: string }
  >();
  private readonly listeners: Update[] = [];

  constructor(
    @InjectRepository(Sensor) private readonly sRepo: Repository<Sensor>,
    @InjectRepository(Patient) private readonly pRepo: Repository<Patient>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.buildBindings();
    this.initMqtt();
  }

  onUpdate(fn: Update) {
    this.listeners.push(fn);
  }

  getVital(pid: number, sid: number) {
    return this.vitalMap.get(pid)?.get(sid) ?? -1;
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }

  getConnectionInfo(): {
    connected: boolean;
    bindingsCount: number;
    patientsCount: number;
    vitalsData: Array<{ patient_id: number; vitals: Record<number, number> }>;
  } {
    const vitalsData = Array.from(this.vitalMap.entries()).map(
      ([patient_id, vitals]) => ({
        patient_id,
        vitals: Object.fromEntries(vitals.entries()),
      }),
    );

    return {
      connected: this.isConnected(),
      bindingsCount: this.binding.size,
      patientsCount: this.vitalMap.size,
      vitalsData,
    };
  }

  async reloadSensorSubscriptions() {
    await this.buildBindings();
    if (!this.client?.connected) return;
    this.client.unsubscribe('#', () => {
      for (const { topic } of this.binding.values())
        this.client.subscribe(topic);
      this.logger.verbose(`Resubscribed to ${this.binding.size} topics`);
    });
  }

  private async buildBindings() {
    this.binding.clear();
    this.vitalMap.clear();
    const sensors = await this.sRepo.find({
      where: { mac: Not(IsNull()) },
      select: ['id', 'mac', 'sensorType_Id', 'bed_id'],
      relations: ['bed'],
    });

    sensors.forEach((s) => {
      // หาผู้ป่วยจากเตียงที่เซนเซอร์ผูกอยู่ (ใช้ bed.patient_id โดยตรง)
      if (!s.bed?.patient_id) {
        return;
      }

      const patient_id = s.bed.patient_id;
      const sid = s.sensorType_Id ?? 1;
      const prefix = PREFIX[sid];
      if (!prefix) {
        return;
      }
      const topic = `${prefix}/${s.mac}`;
      this.binding.set(s.mac, { pid: patient_id, sid, topic });
      if (!this.vitalMap.has(patient_id))
        this.vitalMap.set(patient_id, new Map());
      this.vitalMap.get(patient_id)!.set(sid, -1);
    });

    this.logger.log(
      `Build bindings: ${this.binding.size} sensors, ${this.vitalMap.size} patients`,
    );
  }

  private initMqtt() {
    // โหลดค่า env
    const mqttHost = this.configService.get<string>('MQTT_HOST', 'localhost');
    const mqttPort = this.configService.get<number>('MQTT_PORT', 1883);
    const mqttClientId =
      this.configService.get<string>('MQTT_CLIENT_ID', 'bed-sensor-backend') +
      '_' +
      Math.random().toString(16).slice(2, 10);
    const mqttUsername =
      this.configService.get<string>('MQTT_USERNAME') || 'web';
    const mqttPassword = this.configService.get<string>('MQTT_PASSWORD');
    const mqttReconnect = this.configService.get<number>(
      'MQTT_RECONNECT_PERIOD',
      5000,
    );
    const mqttTimeout = this.configService.get<number>(
      'MQTT_CONNECT_TIMEOUT',
      30000,
    );

    this.logger.log(
      `MQTT Config → host: ${mqttHost}, port: ${mqttPort}, clientId: ${mqttClientId}`,
    );

    const mqttUrl = `mqtt://${mqttHost}:${mqttPort}`;

    this.client = mqtt.connect(mqttUrl, {
      clientId: mqttClientId,
      username: mqttUsername,
      password: mqttPassword,
      reconnectPeriod: mqttReconnect,
      connectTimeout: mqttTimeout,
    });

    this.client.on('connect', () => {
      for (const { topic } of this.binding.values())
        this.client.subscribe(topic);
      this.logger.log(
        `MQTT connected — subscribed to ${this.binding.size} topics`,
      );
    });

    this.client.on('reconnect', () => this.logger.warn('MQTT reconnecting…'));
    this.client.on('error', (err) =>
      this.logger.error(`MQTT error: ${err.message}`),
    );

    this.client.on('message', (topic, payload) => {
      const [, mac] = topic.split('/');
      const bind = this.binding.get(mac);
      if (!bind) return;
      const raw = parseInt(payload.toString().trim(), 10);
      if (Number.isNaN(raw)) return;
      const value = bind.sid === 1 && raw !== -1 ? raw + 1 : raw;
      this.vitalMap.get(bind.pid)!.set(bind.sid, value);
      this.listeners.forEach((fn) => fn(bind.pid, bind.sid, value));
    });
  }
}
