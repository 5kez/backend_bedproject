import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PatientService } from './patient.service';
import { MqttService } from '../mqtt/mqtt.service';
import { NotificationService } from '../notification/notification.service';
import { Patient } from './entities/patient.entity';

@WebSocketGateway({ cors: { origin: '*', credentials: false } })
@Injectable()
export class PatientGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server;
  private lastVitalsState = new Map<
    number,
    { position: number; oxygen: number; heartRate: number }
  >();
  private isInitializing = true; // Flag เพื่อติดตามการเริ่มต้นระบบ

  constructor(
    private readonly pSvc: PatientService,
    private readonly mqtt: MqttService,
    private readonly notificationService: NotificationService,
  ) {
    // ✅ ตั้งค่า MQTT service ใน NotificationService เพื่อให้สามารถตรวจสอบ sensor ได้
    this.notificationService.setMqttService(this.mqtt);
  }

  async afterInit() {
    const ps = await this.pSvc.getAllPatient();

    // โหลดข้อมูล notification settings สำหรับทุก patient ตั้งแต่เริ่มต้น
    await this.preloadNotificationSettings(ps);

    const init = ps.map((p) => ({
      id: p.patient_id,
      status: p.status,
      position: this.mqtt.getVital(p.patient_id, 1), // BedSensor
      heartRate: this.mqtt.getVital(p.patient_id, 2), // HeartRate
      oxygen: this.mqtt.getVital(p.patient_id, 3), // SpO2
    }));

    // Send initial data with the event name that frontend expects
    this.server.emit('patientVitalsUpdate', init);

    // ตั้งค่า lastVitalsState ให้เป็นค่าที่แตกต่างจาก -1 เพื่อให้ตรวจจับการ disconnect ได้
    for (const patient of ps) {
      this.lastVitalsState.set(patient.patient_id, {
        position: 999, // ค่าที่ไม่ใช่ -1 เพื่อให้ตรวจจับ connection_lost ได้
        heartRate: 999, // HeartRate (sensor_type_id = 2)
        oxygen: 999, // SpO2 (sensor_type_id = 3)
      });
    }

    // ตั้งค่า flag ว่าระบบเริ่มต้นเสร็จแล้ว
    this.isInitializing = false;

    // รัน updateAllVitals ครั้งแรกหลังจากตั้งค่า flag แล้ว
    await this.updateAllVitals();

    // Handle real-time updates and send complete patient vitals array
    // Every MQTT message (3 per bed per tick) used to trigger a full patient
    // query + broadcast. Coalesce bursts into at most one update per 500 ms.
    this.mqtt.onUpdate(() => this.scheduleVitalsUpdate());
  }

  private vitalsTimer: NodeJS.Timeout | null = null;
  private scheduleVitalsUpdate() {
    if (this.vitalsTimer) return;
    this.vitalsTimer = setTimeout(() => {
      this.vitalsTimer = null;
      void this.updateAllVitals();
    }, 500);
  }

  // โหลดข้อมูล notification settings ล่วงหน้าสำหรับทุก patient
  private async preloadNotificationSettings(
    patients: Patient[],
  ): Promise<void> {
    for (const patient of patients) {
      const patientId = patient.patient_id;
      console.log(patientId, 'Loading');
      // โหลด notification settings สำหรับ sensor ทั้ง 3 ประเภท
      for (const sensorTypeId of [1, 2, 3]) {
        // Position, HeartRate, SpO2
        try {
          await this.notificationService
            .getNotificationSettingService()
            .findByPatientAndSensorType(patientId, sensorTypeId);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }

  private async updateAllVitals() {
    const patients = await this.pSvc.getAllPatient();

    console.log(
      `🔍 [PatientGateway] Processing ${patients.length} patients for vitals update`,
    );

    const updatedVitals = patients.map((p) => ({
      id: p.patient_id,
      status: p.status,
      position: this.mqtt.getVital(p.patient_id, 1), // BedSensor
      heartRate: this.mqtt.getVital(p.patient_id, 2), // HeartRate
      oxygen: this.mqtt.getVital(p.patient_id, 3), // SpO2
    }));

    // ตรวจสอบและสร้าง notification เฉพาะเมื่อค่าเปลี่ยนแปลง
    for (const patient of patients) {
      const pid = patient.patient_id;
      const patientName = patient.name;
      const roomId = patient.room_id;
      const bedId = patient.bed?.bed_id; // ใช้ relationship กับ bed
      const departmentId = patient.department_id; // เพิ่ม department_id

      // ✅ Log เพื่อดูว่า patient ไหนมี bed_id หรือไม่
      if (!bedId) {
        console.log(
          `⚠️ [PatientGateway] Patient ${pid} (${patientName}) has no bed_id - skipping notification check`,
        );
        continue; // ข้าม patient ที่ไม่มีเตียง
      }

      console.log(
        `🔍 [PatientGateway] Checking patient ${pid} (${patientName}), bed ${bedId}, dept ${departmentId}`,
      );

      const currentVitals = {
        position: this.mqtt.getVital(pid, 1), // BedSensor
        heartRate: this.mqtt.getVital(pid, 2), // HeartRate
        oxygen: this.mqtt.getVital(pid, 3), // SpO2
      };

      const lastVitals = this.lastVitalsState.get(pid);

      // ข้ามการสร้าง notification ในครั้งแรกเมื่อระบบเริ่มต้น
      if (!this.isInitializing) {
        // ตรวจสอบ BedSensor (sensor_type_id = 1) แยกกัน
        const positionChanged =
          !lastVitals || lastVitals.position !== currentVitals.position;

        if (positionChanged) {
          if (
            currentVitals.position === -1 &&
            (!lastVitals || lastVitals.position !== -1)
          ) {
            // console.log(`❌ [PatientGateway] BedSensor disconnected for patient ${pid}`);
            // console.log(`📤 [PatientGateway] Sending disconnection alert to notification service:`, {
            //   patient_id: pid,
            //   patient_name: patientName,
            //   sensor_type_id: 1,
            //   sensor_type_name: 'BedSensor',
            //   alert_type: 'connection_lost',
            //   sensor_value: -1,
            //   threshold: null
            // });
            void this.notificationService.createSensorAlert(
              pid,
              patientName,
              1,
              'BedSensor',
              'connection_lost',
              -1,
              null,
              undefined,
              roomId,
              bedId,
              departmentId,
            );
          } else if (
            currentVitals.position !== -1 &&
            lastVitals &&
            lastVitals.position === -1
          ) {
            // ยกเลิก notification เมื่อ BedSensor กลับมาเชื่อมต่อ
            // console.log(`✅ [PatientGateway] BedSensor reconnected for patient ${pid}, new position: ${currentVitals.position}`);
            void this.notificationService.cancelSensorAlert(pid, 1);

            // แต่ถ้า position ที่กลับมาต้องการแจ้งเตือน ให้สร้าง notification ใหม่
            // console.log(`🔍 [PatientGateway] Checking if reconnected position needs alert for patient ${pid}: position=${currentVitals.position}`);
            // console.log(`📤 [PatientGateway] Sending position check to notification service:`, {
            //   patient_id: pid,
            //   patient_name: patientName,
            //   sensor_type_id: 1,
            //   sensor_type_name: 'BedSensor',
            //   alert_type: 'position_check',
            //   sensor_value: currentVitals.position,
            //   threshold: null
            // });
            void this.notificationService.createSensorAlert(
              pid,
              patientName,
              1,
              'BedSensor',
              'position_check',
              currentVitals.position,
              null,
              undefined,
              roomId,
              bedId,
            );
          } else if (currentVitals.position !== -1) {
            // ให้ notification service ตัดสินใจเองตาม setting
            // console.log(`🔍 [PatientGateway] Checking position alert for patient ${pid}: position=${currentVitals.position}`);
            // console.log(`📤 [PatientGateway] Sending position check to notification service:`, {
            //   patient_id: pid,
            //   patient_name: patientName,
            //   sensor_type_id: 1,
            //   sensor_type_name: 'BedSensor',
            //   alert_type: 'position_check',
            //   sensor_value: currentVitals.position,
            //   threshold: null
            // });
            void this.notificationService.createSensorAlert(
              pid,
              patientName,
              1,
              'BedSensor',
              'position_check',
              currentVitals.position,
              null,
              undefined,
              roomId,
              bedId,
            );
          }
        }

        // ตรวจสอบ HeartRate (sensor_type_id = 2) แยกกัน
        if (!lastVitals || lastVitals.heartRate !== currentVitals.heartRate) {
          if (
            currentVitals.heartRate === -1 &&
            (!lastVitals || lastVitals.heartRate !== -1)
          ) {
            // console.log(`❌ [PatientGateway] HeartRate disconnected for patient ${pid}`);
            void this.notificationService.createSensorAlert(
              pid,
              patientName,
              2,
              'HeartRate',
              'connection_lost',
              -1,
              null,
              undefined,
              roomId,
              bedId,
            );
          } else if (
            currentVitals.heartRate !== -1 &&
            lastVitals &&
            lastVitals.heartRate === -1
          ) {
            // ยกเลิก notification เมื่อ HeartRate กลับมาเชื่อมต่อ
            // console.log(`✅ [PatientGateway] HeartRate reconnected for patient ${pid}, new heartRate: ${currentVitals.heartRate}`);
            void this.notificationService.cancelSensorAlert(pid, 2);

            // แต่ถ้า heartRate ที่กลับมาต้องการแจ้งเตือน ให้สร้าง notification ใหม่
            // console.log(`🔍 [PatientGateway] Checking if reconnected heartRate needs alert for patient ${pid}: heartRate=${currentVitals.heartRate}`);
            // console.log(`📤 [PatientGateway] Sending heartRate check to notification service:`, {
            //   patient_id: pid,
            //   patient_name: patientName,
            //   sensor_type_id: 2,
            //   sensor_type_name: 'HeartRate',
            //   alert_type: 'heartrate_check',
            //   sensor_value: currentVitals.heartRate,
            //   threshold: null
            // });
            void this.notificationService.createSensorAlert(
              pid,
              patientName,
              2,
              'HeartRate',
              'heartrate_check',
              currentVitals.heartRate,
              null,
              undefined,
              roomId,
              bedId,
            );
          } else if (currentVitals.heartRate !== -1) {
            // ให้ notification service ตัดสินใจเองตาม setting
            // console.log(`🔍 [PatientGateway] Checking heartRate alert for patient ${pid}: heartRate=${currentVitals.heartRate}`);
            void this.notificationService.createSensorAlert(
              pid,
              patientName,
              2,
              'HeartRate',
              'heartrate_check',
              currentVitals.heartRate,
              null,
              undefined,
              roomId,
              bedId,
            );
          }
        }

        // ตรวจสอบ SpO2 (sensor_type_id = 3) แยกกัน
        if (!lastVitals || lastVitals.oxygen !== currentVitals.oxygen) {
          if (
            currentVitals.oxygen === -1 &&
            (!lastVitals || lastVitals.oxygen !== -1)
          ) {
            // console.log(`❌ [PatientGateway] SpO2 disconnected for patient ${pid}`);
            void this.notificationService.createSensorAlert(
              pid,
              patientName,
              3,
              'SpO2',
              'connection_lost',
              -1,
              null,
              undefined,
              roomId,
              bedId,
            );
          } else if (
            currentVitals.oxygen !== -1 &&
            lastVitals &&
            lastVitals.oxygen === -1
          ) {
            // ยกเลิก notification เมื่อ SpO2 กลับมาเชื่อมต่อ
            // console.log(`✅ [PatientGateway] SpO2 reconnected for patient ${pid}, new oxygen: ${currentVitals.oxygen}`);
            void this.notificationService.cancelSensorAlert(pid, 3);

            // แต่ถ้า SpO2 ที่กลับมาต้องการแจ้งเตือน ให้สร้าง notification ใหม่
            // console.log(`🔍 [PatientGateway] Checking if reconnected SpO2 needs alert for patient ${pid}: oxygen=${currentVitals.oxygen}`);
            // console.log(`📤 [PatientGateway] Sending SpO2 check to notification service:`, {
            //   patient_id: pid,
            //   patient_name: patientName,
            //   sensor_type_id: 3,
            //   sensor_type_name: 'SpO2',
            //   alert_type: 'spo2_check',
            //   sensor_value: currentVitals.oxygen,
            //   threshold: null
            // });
            void this.notificationService.createSensorAlert(
              pid,
              patientName,
              3,
              'SpO2',
              'spo2_check',
              currentVitals.oxygen,
              null,
              undefined,
              roomId,
              bedId,
            );
          } else if (currentVitals.oxygen !== -1) {
            // ให้ notification service ตัดสินใจเองตาม setting
            // console.log(`🔍 [PatientGateway] Checking SpO2 alert for patient ${pid}: oxygen=${currentVitals.oxygen}`);
            void this.notificationService.createSensorAlert(
              pid,
              patientName,
              3,
              'SpO2',
              'oxygen_check',
              currentVitals.oxygen,
              null,
              undefined,
              roomId,
              bedId,
            );
          }
        }
      }

      // บันทึกสถานะปัจจุบัน
      this.lastVitalsState.set(pid, currentVitals);
    }

    this.server.emit('patientVitalsUpdate', updatedVitals);
  }

  // ✅ ฟังก์ชันตรวจสอบเงื่อนไขใหม่หลังจากยืนยัน notification
  private async recheckPatientCondition(
    patientId: number,
    sensorTypeId: number,
  ) {
    const patients = await this.pSvc.getAllPatient();
    const patient = patients.find((p) => p.patient_id === patientId);

    if (!patient) return;

    const currentVitals = {
      position: this.mqtt.getVital(patientId, 1), // BedSensor
      heartRate: this.mqtt.getVital(patientId, 2), // HeartRate
      oxygen: this.mqtt.getVital(patientId, 3), // SpO2
    };

    const patientName = patient.name;
    const roomId = patient.room_id;
    const bedId = patient.bed?.bed_id; // ใช้ relationship กับ bed

    // ตรวจสอบเฉพาะ sensor type ที่ยืนยันไป
    switch (sensorTypeId) {
      case 1: // BedSensor
        if (currentVitals.position === -1) {
          void this.notificationService.createSensorAlert(
            patientId,
            patientName,
            1,
            'BedSensor',
            'connection_lost',
            -1,
            null,
            undefined,
            roomId,
            bedId,
          );
        }
        break;

      case 2: // HeartRate
        if (currentVitals.heartRate === -1) {
          void this.notificationService.createSensorAlert(
            patientId,
            patientName,
            2,
            'HeartRate',
            'connection_lost',
            -1,
            null,
            undefined,
            roomId,
            bedId,
          );
        } else if (
          currentVitals.heartRate < 60 ||
          currentVitals.heartRate > 100
        ) {
          const alertType =
            currentVitals.heartRate < 60 ? 'low_heartrate' : 'high_heartrate';
          void this.notificationService.createSensorAlert(
            patientId,
            patientName,
            2,
            'HeartRate',
            alertType,
            currentVitals.heartRate,
            { threshold_low: 60, threshold_high: 100 },
            undefined,
            roomId,
            bedId,
          );
        }
        break;

      case 3: // SpO2
        if (currentVitals.oxygen === -1) {
          void this.notificationService.createSensorAlert(
            patientId,
            patientName,
            3,
            'SpO2',
            'connection_lost',
            -1,
            null,
            undefined,
            roomId,
            bedId,
          );
        } else if (currentVitals.oxygen !== -1 && currentVitals.oxygen < 95) {
          void this.notificationService.createSensorAlert(
            patientId,
            patientName,
            3,
            'SpO2',
            'low_oxygen',
            currentVitals.oxygen,
            { threshold_low: 95 },
            undefined,
            roomId,
            bedId,
          );
        }
        break;
    }
  }

  // ✅ WebSocket handler สำหรับการตรวจสอบเงื่อนไขใหม่หลังยืนยัน notification
  @SubscribeMessage('recheckSensorCondition')
  async handleRecheckSensorCondition(
    @MessageBody() data: { patient_id: number; sensor_type_id: number },
  ) {
    await this.recheckPatientCondition(data.patient_id, data.sensor_type_id);
  }
}
