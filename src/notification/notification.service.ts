import { Injectable, Logger } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationStatus } from './entities/notification.entity';
import { NotificationSettingService } from '../notification-setting/notification-setting.service';
import { HistoryNotificationService } from '../history_notification/history_notification.service';
import type { NotificationSetting } from '../notification-setting/entities/notification-setting.entity';
import type { MqttService } from '../mqtt/mqtt.service';

// Global Registry สำหรับ real-time callbacks
class NotificationCallbackRegistry {
  private static instance: NotificationCallbackRegistry;
  private readonly logger = new Logger('NotificationCallbackRegistry');
  private onNotificationCreated?: (notification: NotificationItem) => void;
  private onNotificationConfirmed?: (
    patientId: number,
    sensorTypeId: number,
  ) => void;

  static getInstance(): NotificationCallbackRegistry {
    if (!NotificationCallbackRegistry.instance) {
      NotificationCallbackRegistry.instance =
        new NotificationCallbackRegistry();
    }
    return NotificationCallbackRegistry.instance;
  }

  setNotificationCreatedCallback(
    callback: (notification: NotificationItem) => void,
  ) {
    this.logger.debug(
      '🌍 [Global Registry] Setting notification created callback',
    );
    this.onNotificationCreated = callback;
  }

  setNotificationConfirmedCallback(
    callback: (patientId: number, sensorTypeId: number) => void,
  ) {
    this.logger.debug(
      '🌍 [Global Registry] Setting notification confirmed callback',
    );
    this.onNotificationConfirmed = callback;
  }

  triggerNotificationCreated(notification: NotificationItem) {
    if (this.onNotificationCreated) {
      this.logger.debug(
        `📡 [Global Registry] Broadcasting notification: ${notification.id}`,
      );
      this.onNotificationCreated(notification);
    } else {
      this.logger.debug(
        '⚠️ [Global Registry] No notification created callback set',
      );
    }
  }

  triggerNotificationConfirmed(patientId: number, sensorTypeId: number) {
    if (this.onNotificationConfirmed) {
      this.logger.debug(
        `📡 [Global Registry] Broadcasting confirmation: Patient ${patientId}, Sensor ${sensorTypeId}`,
      );
      this.onNotificationConfirmed(patientId, sensorTypeId);
    } else {
      this.logger.debug(
        '⚠️ [Global Registry] No notification confirmed callback set',
      );
    }
  }
}

export interface NotificationMetadata {
  alertType?: string;
  sensorValue?: number | string;
  threshold?:
    | { threshold_low?: number; threshold_high?: number }
    | string
    | null;
  timestamp?: Date;
  setting_id?: number;
  department_id?: number;
  device_id?: string;
}

export interface NotificationItem {
  id: number;
  patient_id: number;
  patient_name: string;
  sensor_type_id: number;
  sensor_type_name: string;
  message: string;
  details?: string;
  status: NotificationStatus;
  user_id?: number;
  room_id?: number;
  bed_id?: number;
  metadata?: NotificationMetadata;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private notifications: NotificationItem[] = [];
  private idCounter = 1;
  private onNotificationCreated?: (notification: NotificationItem) => void;
  private instanceId: string = Math.random().toString(36).substring(7); // Add unique identifier

  // เพิ่ม debounce tracking สำหรับป้องกัน notification ซ้ำ
  private recheckTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private recentlyProcessed: Set<string> = new Set(); // เก็บ patient_id + sensor_type_id ที่เพิ่งประมวลผลไป

  constructor(
    private readonly notificationSettingService: NotificationSettingService,
    private readonly historyNotificationService: HistoryNotificationService,
  ) {
    this.logger.debug(
      `🏗️ [NotificationService] Constructor called - Instance ID: ${this.instanceId}`,
    );
  }

  // เพิ่ม callback สำหรับ real-time notification (ใช้ Global Registry แล้ว)
  private mqttService?: MqttService; // สำหรับเข้าถึง sensor data ล่าสุด

  setMqttService(mqttService: MqttService) {
    this.mqttService = mqttService;
  }

  // เพิ่ม getter เพื่อให้ PatientGateway เข้าถึง NotificationSettingService ได้
  getNotificationSettingService() {
    return this.notificationSettingService;
  }

  setNotificationCreatedCallback(
    callback: (notification: NotificationItem) => void,
  ) {
    this.logger.debug(
      `🔗 [NotificationService] Instance ${this.instanceId} - Forwarding callback to Global Registry`,
    );
    const registry = NotificationCallbackRegistry.getInstance();
    registry.setNotificationCreatedCallback(callback);

    // ✅ ตั้งค่า local callback ด้วย
    this.onNotificationCreated = callback;
  }

  setNotificationConfirmedCallback(
    callback: (patientId: number, sensorTypeId: number) => void,
  ) {
    this.logger.debug(
      `🔗 [NotificationService] Instance ${this.instanceId} - Forwarding confirmation callback to Global Registry`,
    );
    const registry = NotificationCallbackRegistry.getInstance();
    registry.setNotificationConfirmedCallback(callback);
  }

  create(createNotificationDto: CreateNotificationDto): NotificationItem {
    const notification: NotificationItem = {
      id: this.idCounter++,
      ...createNotificationDto,
      status: createNotificationDto.status || NotificationStatus.UNREAD,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.notifications.unshift(notification); // เพิ่มที่ด้านหน้าเพื่อให้ล่าสุดอยู่บน

    this.logger.debug(
      `✨ [NotificationService] Instance ${this.instanceId} - Created new notification:`,
      {
        id: notification.id,
        patient_name: notification.patient_name,
        sensor_type_id: notification.sensor_type_id,
        message: notification.message,
      },
    );

    // ส่ง real-time notification ผ่าน Global Registry
    this.logger.debug(
      `🔍 [NotificationService] Instance ${this.instanceId} - Broadcasting through Global Registry`,
    );
    const registry = NotificationCallbackRegistry.getInstance();
    registry.triggerNotificationCreated(notification);

    return notification;
  }

  findAll(): NotificationItem[] {
    return [...this.notifications]; // return copy
  }

  findOne(id: number): NotificationItem | null {
    return this.notifications.find((n) => n.id === id) || null;
  }

  findByPatientId(patient_id: number): NotificationItem[] {
    return this.notifications.filter((n) => n.patient_id === patient_id);
  }

  findByUserId(user_id: number): NotificationItem[] {
    return this.notifications.filter((n) => n.user_id === user_id);
  }

  findByStatus(status: NotificationStatus): NotificationItem[] {
    return this.notifications.filter((n) => n.status === status);
  }

  // ดึง notifications ตาม department ของ patient
  findByDepartment(
    department_id: number,
    status?: NotificationStatus,
  ): NotificationItem[] {
    this.logger.debug(
      `🔔 [Backend] Finding notifications for department: ${department_id}, status: ${status || 'all'}`,
    );
    this.logger.debug(
      `📊 [Backend] Total notifications in memory: ${this.notifications.length}`,
    );

    // เพิ่มข้อมูล debug สำหรับ notification แต่ละตัว
    if (this.notifications.length > 0) {
      this.logger.debug('🔍 [Backend] All notifications:');
      this.notifications.forEach((notif, index) => {
        this.logger.debug(
          `  ${index + 1}. ID: ${notif.id}, Patient: ${notif.patient_name}, bed_id: ${notif.bed_id}, dept: ${notif.metadata?.department_id}`,
        );
      });
    } else {
      this.logger.debug(
        '⚠️ [Backend] No notifications found in memory - they may not have been created yet',
      );
    }

    const filteredNotifications = this.notifications.filter((notification) => {
      // กรองตาม status ถ้ามีการกำหนด
      if (status && notification.status !== status) {
        return false;
      }

      // 🔍 Debug: ดู notification แต่ละตัว
      this.logger.debug(`🔔 Checking notification ${notification.id}:`, {
        patient_name: notification.patient_name,
        bed_id: notification.bed_id,
        metadata_dept: notification.metadata?.department_id,
      });

      // ✅ กรองเฉพาะ notification ที่มี bed_id > 0 (ต้องมีเตียงจริง)
      const hasBed = notification.bed_id && notification.bed_id > 0;

      if (!hasBed) {
        this.logger.debug(
          `❌ Notification ${notification.id} rejected: bed_id = ${notification.bed_id} (must be > 0)`,
        );
        return false;
      }

      // ✅ กรองตาม department โดยตรวจสอบจาก metadata หรือ ใช้ patient service
      if (notification.metadata?.department_id) {
        const deptMatch = notification.metadata.department_id === department_id;
        this.logger.debug(
          `🏥 Notification ${notification.id} department check:`,
          {
            notification_dept: notification.metadata.department_id,
            target_dept: department_id,
            match: deptMatch,
          },
        );
        return deptMatch;
      }

      // ถ้าไม่มี department info ใน metadata ให้ส่งกลับทั้งหมดก่อน
      this.logger.debug(
        `⚠️ Notification ${notification.id} has no department info - including anyway`,
      );
      return true;
    });

    this.logger.debug(
      `📊 [Backend] Filtered notifications: ${filteredNotifications.length} out of ${this.notifications.length}`,
    );
    return filteredNotifications;
  }

  // ✅ Method สำหรับสร้าง test notification
  createTestNotification(department_id: number = 1): NotificationItem[] {
    this.logger.debug(
      `🧪 [Backend] Creating test notification for department: ${department_id}`,
    );
    this.logger.debug(
      `📡 [Backend] Real-time callback is set: ${!!this.onNotificationCreated}`,
    );

    // สร้าง test notification เดียวเพื่อทดสอบ real-time
    const testNotification = this.create({
      patient_id: 999,
      patient_name: 'ผู้ป่วยทดสอบ Real-time',
      sensor_type_id: 1,
      sensor_type_name: 'BedSensor',
      message: 'การแจ้งเตือนทดสอบระบบ Real-time',
      details: 'นี่คือการทดสอบระบบแจ้งเตือนแบบ Real-time - ไม่ต้องกด F5!',
      status: NotificationStatus.UNREAD,
      user_id: undefined,
      room_id: 1,
      bed_id: 1,
      metadata: {
        alertType: 'real_time_test',
        sensorValue: 'test_value',
        threshold: 'test_threshold',
        timestamp: new Date(),
        setting_id: 1,
        department_id: department_id,
      },
    });

    this.logger.debug(
      `✅ [Backend] Test notification created and should be broadcasted:`,
      {
        id: testNotification.id,
        message: testNotification.message,
      },
    );

    return [testNotification];
  }

  getUnreadCount(user_id?: number): number {
    if (user_id) {
      return this.notifications.filter(
        (n) => n.status === NotificationStatus.UNREAD && n.user_id === user_id,
      ).length;
    }
    return this.notifications.filter(
      (n) => n.status === NotificationStatus.UNREAD,
    ).length;
  }

  markAsRead(id: number): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.status = NotificationStatus.READ;
      notification.updated_at = new Date();
    }
  }

  markAsReadByIds(ids: number[]): void {
    this.notifications.forEach((notification) => {
      if (ids.includes(notification.id)) {
        notification.status = NotificationStatus.READ;
        notification.updated_at = new Date();
      }
    });
  }

  markAllAsRead(user_id?: number): void {
    this.notifications.forEach((notification) => {
      if (notification.status === NotificationStatus.UNREAD) {
        if (!user_id || notification.user_id === user_id) {
          notification.status = NotificationStatus.READ;
          notification.updated_at = new Date();
        }
      }
    });
  }

  dismiss(id: number): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.status = NotificationStatus.DISMISSED;
      notification.updated_at = new Date();
    }
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto): void {
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      Object.assign(notification, updateNotificationDto);
      notification.updated_at = new Date();
    }
  }

  remove(id: number): void {
    const index = this.notifications.findIndex((n) => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
    }
  }

  // Clear old notifications (สำหรับ cleanup)
  clearOldNotifications(olderThanHours: number = 24): void {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - olderThanHours);

    this.notifications = this.notifications.filter(
      (n) => n.created_at > cutoffTime,
    );
  }

  // Get memory usage info
  getMemoryInfo(): { count: number; estimatedSizeKB: number } {
    const count = this.notifications.length;
    const estimatedSizeKB = Math.round(
      JSON.stringify(this.notifications).length / 1024,
    );
    return { count, estimatedSizeKB };
  }

  // สำหรับสร้าง notification จาก sensor data พร้อมตรวจสอบ setting
  async createSensorAlert(
    patient_id: number,
    patient_name: string,
    sensor_type_id: number,
    sensor_type_name: string,
    alertType: string,
    sensorValue: number,
    threshold?: { threshold_low?: number; threshold_high?: number } | null,
    user_id?: number,
    room_id?: number,
    bed_id?: number,
    department_id?: number,
  ): Promise<NotificationItem | null> {
    // ✅ ตรวจสอบว่ามี notification ที่ยังไม่ได้ยืนยันของ patient และ sensor type เดียวกันหรือไม่
    this.logger.debug(
      `🔍 [Backend] Checking for existing notifications - Patient: ${patient_id}, SensorType: ${sensor_type_id}`,
    );

    // ตรวจสอบ notification ที่ยังไม่ได้ยืนยัน
    const unreadNotification = this.notifications.find(
      (n) =>
        n.patient_id === patient_id &&
        n.sensor_type_id === sensor_type_id &&
        n.status === NotificationStatus.UNREAD,
    );

    if (unreadNotification) {
      this.logger.debug(
        `⏭️ [Backend] Skipping - unread notification exists: ${unreadNotification.id}`,
      );
      return null;
    }

    // ตรวจสอบ notification ที่สร้างล่าสุดในช่วง 5 วินาทีที่ผ่านมา (ป้องกันการสร้างซ้ำในช่วงเวลาสั้น)
    const now = new Date();
    const recentNotification = this.notifications.find(
      (n) =>
        n.patient_id === patient_id &&
        n.sensor_type_id === sensor_type_id &&
        now.getTime() - n.created_at.getTime() < 5000, // ลดเหลือ 5 วินาที
    );

    if (recentNotification) {
      const timeDiff = now.getTime() - recentNotification.created_at.getTime();
      this.logger.debug(
        `⏭️ [Backend] Skipping - recent notification exists: ${recentNotification.id}, time diff: ${timeDiff}ms`,
      );
      return null;
    }

    this.logger.debug(
      `✅ [Backend] No blocking notifications found - proceeding to create`,
    );

    // ตรวจสอบ notification setting ของ patient และ sensor type นี้
    let setting =
      await this.notificationSettingService.findByPatientAndSensorType(
        patient_id,
        sensor_type_id,
      );

    // ✅ ถ้าไม่มี setting ให้สร้างแบบ default อัตโนมัติ (สำหรับ patient เก่าที่ยังไม่มี settings)
    if (!setting) {
      this.logger.debug(
        `⚠️ [Backend] No notification setting found for patient ${patient_id}, sensor ${sensor_type_id} - Creating default settings`,
      );
      try {
        // สร้าง default config ตาม sensor type
        const getDefaultConfig = (sensorTypeId: number) => {
          switch (sensorTypeId) {
            case 1: // BedSensor
              return { alert_positions: [3, 4, 5] };
            case 2: // HeartRate
              return { threshold_low: 60, threshold_high: 100 };
            case 3: // SpO2
              return { threshold_low: 90 };
            default:
              return { threshold: { min: 0, max: 100 } };
          }
        };

        // สร้าง setting ใหม่
        await this.notificationSettingService.create({
          patient_id,
          sensor_type_id,
          enabled: true,
          config: getDefaultConfig(sensor_type_id),
        });

        // ดึง setting ที่สร้างใหม่กลับมา
        setting =
          await this.notificationSettingService.findByPatientAndSensorType(
            patient_id,
            sensor_type_id,
          );
        this.logger.debug(
          `✅ [Backend] Created default setting: ${setting?.id}`,
        );
      } catch (error) {
        this.logger.error(
          `❌ [Backend] Failed to create default setting:`,
          error,
        );
        return null;
      }
    }

    // ถ้า setting ปิดการแจ้งเตือน (!enabled) ไม่สร้าง notification
    if (!setting || !setting.enabled) {
      this.logger.debug(
        `⚠️ [Backend] Cannot create notification for patient ${patient_id}, sensor ${sensor_type_id} - Setting disabled:`,
        {
          settingExists: !!setting,
          enabled: setting?.enabled,
        },
      );
      return null;
    }

    // ✅ แก้ไขปัญหา bed_id undefined โดยดึงจาก patient data ถ้าไม่มี
    let finalBedId = bed_id;
    let finalDepartmentId = department_id;

    if (!finalBedId || !finalDepartmentId) {
      const patient = setting.patient;
      if (patient) {
        finalBedId = finalBedId || patient.bed_id;
        finalDepartmentId = finalDepartmentId || patient.department_id;
        this.logger.debug(
          `🔧 [Backend] Fixed missing data - bed_id: ${finalBedId}, department_id: ${finalDepartmentId}`,
        );
      }
    }

    // ถ้ายังไม่มี bed_id ให้ skip การสร้าง notification
    if (!finalBedId) {
      this.logger.debug(
        `❌ [Backend] Cannot create notification - missing bed_id for patient ${patient_id}`,
        {
          patient_name: patient_name,
          sensor_type_id,
          sensor_type_name,
        },
      );
      return null;
    }

    this.logger.debug(
      `✅ [Backend] All checks passed - Creating notification for patient ${patient_id} (${patient_name}), bed ${finalBedId}, sensor ${sensor_type_name}`,
    );

    // ตรวจสอบเงื่อนไขตาม setting
    this.logger.debug(
      `🔍 [Backend] About to call shouldCreateNotification with:`,
      {
        sensorValue,
        alertType,
        settingExists: !!setting,
        settingId: setting?.id,
        settingType: setting?.sensor_type_id,
      },
    );

    const shouldCreate = this.shouldCreateNotification(
      sensorValue,
      alertType,
      setting,
    );

    this.logger.debug(`🚨 [Backend] Should create new alert: ${shouldCreate}`);

    if (!shouldCreate) {
      this.logger.debug(
        `⏭️ [Backend] Not creating notification - shouldCreateNotification returned false`,
      );
      return null;
    }

    let message = '';
    let details = '';

    // กรณี sensor หลุดการเชื่อมต่อ (ค่า = -1)
    if (sensorValue === -1) {
      message = `${sensor_type_name}`;
      details = `หลุดการเชื่อมต่อ`;
    } else {
      // กรณีปกติ - ตรวจสอบตาม sensor type
      switch (sensor_type_id) {
        case 1: // BedSensor
          message = `BedSensor`;
          details = `ตำแหน่ง: ${sensorValue}, การแจ้งเตือน: ${alertType}`;
          break;
        case 2: {
          // HeartRate - sensor_type_id 2 is the heartrate/<mac> MQTT channel
          // (see MqttService PREFIX and PatientGateway). The SpO2/HeartRate
          // texts used to be swapped here, so a fast pulse was reported as
          // "low blood oxygen".
          const hrLow = setting.config.threshold_low ?? 60;
          const hrHigh = setting.config.threshold_high ?? 100;
          message = `HeartRate`;
          if (sensorValue < hrLow) {
            details = `อัตราการเต้นของหัวใจ: ${sensorValue} bpm (ต่ำกว่า ${hrLow} bpm)`;
          } else {
            details = `อัตราการเต้นของหัวใจ: ${sensorValue} bpm (สูงกว่า ${hrHigh} bpm)`;
          }
          break;
        }
        case 3: {
          // SpO2 - sensor_type_id 3 is the spo2/<mac> MQTT channel
          const spo2Low = setting.config.threshold_low ?? 90;
          message = `SpO2`;
          details = `ระดับออกซิเจนในเลือด: ${sensorValue}% (ต่ำกว่า ${spo2Low}%)`;
          break;
        }
        default:
          message = `${sensor_type_name}`;
          details = `ค่า: ${JSON.stringify(sensorValue)}, ${alertType}`;
      }
    }

    const createNotificationDto: CreateNotificationDto = {
      patient_id,
      patient_name,
      sensor_type_id,
      sensor_type_name,
      message,
      details,
      user_id: undefined, // ✅ ไม่ระบุ user_id เพื่อให้ broadcast ไปทุกคน
      room_id,
      bed_id: finalBedId, // ใช้ bed_id ที่แก้ไขแล้ว
      metadata: {
        alertType,
        sensorValue,
        threshold: {
          threshold_low: setting.config?.threshold_low,
          threshold_high: setting.config?.threshold_high,
        },
        timestamp: new Date(),
        setting_id: setting.id,
        department_id: finalDepartmentId, // ใช้ department_id ที่แก้ไขแล้ว
      },
    };

    return this.create(createNotificationDto);
  }

  // ยืนยัน notification และบันทึกลง history
  async confirmNotification(
    id: number,
    user_id?: number,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.debug(
      `🔔 [Backend] Confirming notification ${id}, user: ${user_id}`,
    );

    const notification = this.notifications.find((n) => n.id === id);
    if (!notification) {
      this.logger.debug(`❌ [Backend] Notification ${id} not found in memory`);
      return { success: false, message: 'Notification not found' };
    }

    this.logger.debug(`✅ [Backend] Found notification:`, {
      id: notification.id,
      patient_id: notification.patient_id,
      sensor_type_id: notification.sensor_type_id,
      patient_name: notification.patient_name,
    });

    try {
      // เก็บข้อมูลของ notification ที่จะลบ เพื่อใช้ตรวจสอบใหม่
      const patientId = notification.patient_id;
      const sensorTypeId = notification.sensor_type_id;

      this.logger.debug(`💾 [Backend] Saving to history_notification...`);

      // บันทึกลง history_notification
      await this.historyNotificationService.create({
        Patient_Id: notification.patient_id,
        Noti_time: new Date(), // ✅ ส่ง Date object แทน ISO string
        Noti_type: notification.sensor_type_name, // ประเภท sensor
        Noti_desc: notification.details || notification.message, // ✅ ใช้ details เป็นหลัก
        Noti_id: notification.id,
        Noti_setting_id: notification.metadata?.setting_id || 0,
        Status: 1, // 1 = confirmed
        Sensor_id: notification.sensor_type_id,
        Sensor_type: notification.sensor_type_name, // ต้องตรงกับ Noti_type
        Device_id: notification.metadata?.device_id || '',
        User_id: user_id || notification.user_id || 0,
        Patient_indate: new Date(),
        Patient_remark: notification.details || '',
        Patient_department: '',
        Patient_room_num: 0,
      });

      this.logger.debug(`✅ [Backend] Saved to history successfully`);

      // ลบ notification จาก memory
      this.remove(id);

      this.logger.debug(`🗑️ [Backend] Removed notification ${id} from memory`);

      // ✅ เรียก callback ผ่าน Global Registry เพื่อให้ระบบตรวจสอบเงื่อนไขใหม่
      this.logger.debug(
        `🔍 [NotificationService] Instance ${this.instanceId} - Broadcasting confirmation through Global Registry`,
      );
      const registry = NotificationCallbackRegistry.getInstance();
      registry.triggerNotificationConfirmed(patientId, sensorTypeId);

      // ✅ ตรวจสอบประเภทของ notification ที่ถูกยืนยัน
      const isUrgentCondition =
        notification.message.includes('หายการเชื่อมต่อ') ||
        notification.message.includes('disconnected') ||
        notification.message.includes('ออกจากเตียง') ||
        notification.details?.includes('position') === true;

      // ✅ สำหรับกรณีเร่งด่วน ให้ recheck เร็วขึ้น
      if (this.mqttService) {
        const delayTime = isUrgentCondition ? 100 : 200; // เร่งด่วน: 100ms, ปกติ: 200ms
        this.logger.debug(
          `⏰ [Backend] Scheduling recheck in ${delayTime}ms (urgent: ${isUrgentCondition})`,
        );

        setTimeout(() => {
          void this.recheckSensorCondition(patientId, sensorTypeId);
        }, delayTime);
      }

      return {
        success: true,
        message: 'Notification confirmed and saved to history',
      };
    } catch (error) {
      this.logger.error('❌ [Backend] Error confirming notification:', error);
      return { success: false, message: 'Failed to confirm notification' };
    }
  }

  // ยืนยัน notification หลายรายการพร้อมกัน
  async confirmNotificationsBulk(
    ids: number[],
    user_id?: number,
  ): Promise<{ success: boolean; message: string; results: any[] }> {
    const results: Array<{ id: number; success: boolean; message: string }> =
      [];

    for (const id of ids) {
      const result = await this.confirmNotification(id, user_id);
      results.push({ id, ...result });
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return {
      success: failCount === 0,
      message: `Confirmed ${successCount} notifications, ${failCount} failed`,
      results,
    };
  }

  // ยกเลิก notification เมื่อ sensor กลับมาเชื่อมต่อปกติ
  cancelSensorAlert(patient_id: number, sensor_type_id: number): void {
    const existingNotification = this.notifications.find(
      (n) =>
        n.patient_id === patient_id &&
        n.sensor_type_id === sensor_type_id &&
        n.status === NotificationStatus.UNREAD,
    );

    if (existingNotification) {
      // เปลี่ยนสถานะเป็น READ (ยกเลิก)
      existingNotification.status = NotificationStatus.READ;
      existingNotification.updated_at = new Date();

      // ส่ง callback เพื่ออัปเดต real-time (ใช้ onNotificationCreated เพื่อให้ client อัปเดตหน้า UI)
      if (this.onNotificationCreated) {
        this.onNotificationCreated(existingNotification);
      }
    }
  }

  // ✅ ตรวจสอบเงื่อนไข sensor ใหม่หลังจากยืนยัน notification พร้อม debounce
  private async recheckSensorCondition(
    patientId: number,
    sensorTypeId: number,
  ) {
    const recheckKey = `${patientId}-${sensorTypeId}`;

    // ✅ Clear timeout ที่มีอยู่แล้ว
    const existingTimeout = this.recheckTimeouts.get(recheckKey);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.recheckTimeouts.delete(recheckKey);
    }

    // ✅ Check if recently processed to prevent rapid-fire duplicates
    if (this.recentlyProcessed.has(recheckKey)) {
      this.logger.debug(
        `� [Backend] Skipping recheck for Patient ${patientId}, SensorType ${sensorTypeId} - recently processed`,
      );
      return;
    }

    this.logger.debug(
      `�🔄 [Backend] Rechecking sensor condition for Patient ${patientId}, SensorType ${sensorTypeId}`,
    );

    if (!this.mqttService) {
      this.logger.debug('❌ [Backend] No MQTT service available for recheck');
      return;
    }

    try {
      // ✅ Mark as being processed
      this.recentlyProcessed.add(recheckKey);

      // ดึงค่า sensor ปัจจุบัน
      const currentValue = this.mqttService.getVital(patientId, sensorTypeId);
      this.logger.debug(`📊 [Backend] Current sensor value: ${currentValue}`);

      // ดึง notification setting
      const setting =
        await this.notificationSettingService.findByPatientAndSensorType(
          patientId,
          sensorTypeId,
        );

      if (!setting || !setting.enabled) {
        this.logger.debug(
          `⚠️ [Backend] No valid notification setting found or disabled for Patient ${patientId}, SensorType ${sensorTypeId}`,
        );
        this.recentlyProcessed.delete(recheckKey);
        return;
      }

      this.logger.debug(
        `✅ [Backend] Found notification setting for Patient ${patientId}, SensorType ${sensorTypeId}`,
      );

      // ตรวจสอบว่าค่าปัจจุบันยังเป็นปัญหาหรือไม่
      this.logger.debug(
        `🔍 [Backend] Checking shouldCreateNotification with:`,
        {
          currentValue,
          sensorTypeId,
          alertType: 'recheck',
          setting_enabled: setting.enabled,
        },
      );

      const shouldAlert = this.shouldCreateNotification(
        currentValue,
        'recheck',
        setting,
      );

      this.logger.debug(`🚨 [Backend] Should create new alert: ${shouldAlert}`);

      if (shouldAlert) {
        this.logger.debug(
          `🔔 [Backend] Creating new notification for persistent condition`,
        );
        // สร้าง notification ใหม่ทันที - เพิ่ม bed_id จาก patient
        const bedId = setting.patient?.bed_id;
        this.logger.debug(`🏥 [Backend] Patient bed_id: ${bedId}`);

        const newNotification = await this.createSensorAlert(
          patientId,
          setting.patient?.name || 'Unknown',
          sensorTypeId,
          setting.sensorType?.name || 'Unknown',
          'persistent_condition',
          currentValue,
          setting.config,
          undefined, // user_id
          undefined, // room_id
          bedId, // bed_id
        );

        this.logger.debug(
          `✅ [Backend] New notification created from recheck: ${newNotification?.id}`,
        );
      } else {
        this.logger.debug(
          `✅ [Backend] Sensor condition resolved - no new notification needed`,
        );
      }

      // ✅ Clear from recently processed after shorter delay for faster recheck
      setTimeout(() => {
        this.recentlyProcessed.delete(recheckKey);
      }, 2000); // ลดจาก 5 วินาที เหลือ 2 วินาที สำหรับความเร็ว
    } catch (error) {
      this.logger.error('Error rechecking sensor condition:', error);
      this.recentlyProcessed.delete(recheckKey); // Clean up on error
    }
  }

  // ตรวจสอบเงื่อนไขการสร้าง notification ตาม setting
  private shouldCreateNotification(
    sensorValue: number,
    alertType: string,
    setting: NotificationSetting | null,
  ): boolean {
    this.logger.debug(`🔍 [Backend] shouldCreateNotification called with:`, {
      sensorValue,
      alertType,
      sensor_type_id: setting?.sensor_type_id,
    });

    // ตรวจสอบเงื่อนไข threshold
    const result = this.checkThresholdCondition(
      sensorValue,
      alertType,
      setting,
    );
    this.logger.debug(
      `🔍 [Backend] shouldCreateNotification result: ${result}`,
    );
    return result;
  }

  // ตรวจสอบเงื่อนไข threshold
  private checkThresholdCondition(
    sensorValue: number,
    alertType: string,
    setting: NotificationSetting | null,
  ): boolean {
    this.logger.debug(`🔍 [Backend] checkThresholdCondition called:`, {
      sensorValue,
      alertType,
      settingExists: !!setting,
      configExists: !!setting?.config,
    });

    // กรณี sensor หลุดการเชื่อมต่อ (ค่า = -1)
    if (sensorValue === -1) {
      this.logger.debug(
        `🔍 [Backend] Sensor disconnect detected - returning true`,
      );
      return true; // ให้แจ้งเตือนทุกครั้งเมื่อ sensor หลุด
    }

    const config = setting?.config || {};

    const sensorTypeId = setting?.sensor_type_id ?? setting?.sensorType?.id;

    switch (sensorTypeId) {
      case 1: {
        // BedSensor - แจ้งเตือนเมื่อผู้ป่วยออกจากเตียง หรือ เปลี่ยนท่าทาง
        // ใช้เงื่อนไขจาก config ถ้ามี หรือใช้ค่าเริ่มต้น (1=ออกจากเตียง, 5=นั่ง)
        const alertPositions = config.alert_positions || [1, 5]; // array ของ position ที่ต้องแจ้งเตือน
        const shouldAlertPosition = alertPositions.includes(sensorValue);

        return shouldAlertPosition;
      }
      case 2: {
        // HeartRate - ใช้ threshold จาก notification setting
        // (หมายเหตุ: ในโค้ดต้นฉบับ mapping ของ sensor type อาจสลับกัน — ตรวจสอบ mapping จริงในโปรเจค)
        const hrLow = config.threshold_low || 60;
        const hrHigh = config.threshold_high || 100;
        const shouldAlertHR = sensorValue < hrLow || sensorValue > hrHigh;

        return shouldAlertHR;
      }
      case 3: {
        // SpO2 - ใช้ threshold จาก notification setting
        const spo2Threshold = config.threshold_low || 95;
        const shouldAlertSpO2 = sensorValue < spo2Threshold;

        return shouldAlertSpO2;
      }
      default:
        // ถ้าไม่รู้ sensor type ให้แจ้งเตือนเป็น default
        return true;
    }
  }
}
