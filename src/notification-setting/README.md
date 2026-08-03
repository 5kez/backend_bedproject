# Notification Setting Module

## Overview
โมดูลนี้จะจัดการการตั้งค่าการแจ้งเตือนสำหรับผู้ป่วยแต่ละคนตาม sensor type ต่าง ๆ

## ฐานข้อมูล
```sql
CREATE TABLE `notification_setting` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `patient_id` INT NOT NULL,
  `sensor_type_id` INT NOT NULL,
  `enabled` TINYINT(1) NULL DEFAULT '1',
  `config` JSON NOT NULL,
  `updated_at` DATETIME NULL DEFAULT (CURRENT_TIMESTAMP) ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `patient_id` (`patient_id`, `sensor_type_id`) USING BTREE,
  INDEX `sensor_type_id` (`sensor_type_id`) USING BTREE,
  CONSTRAINT `notification_setting_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `notification_setting_ibfk_2` FOREIGN KEY (`sensor_type_id`) REFERENCES `sensor_type` (`sensor_type_id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
```

## คุณสมบัติหลัก

### 1. สร้าง Notification Setting อัตโนมัติ
เมื่อสร้าง patient ใหม่ ระบบจะสร้าง notification setting เริ่มต้นสำหรับทุก sensor type โดยอัตโนมัติ

### 2. Default Configuration
Configuration จะถูกสร้างตาม sensor type ดังนี้:

#### BedSensor (sensor_type_id = 1)
```json
{
  "alert_positions": [3, 4, 5]
}
```

#### HeartRate (sensor_type_id = 2)
```json
{
  "threshold_low": 60,
  "threshold_high": 100
}
```

#### Spo2 (sensor_type_id = 3)
```json
{
  "threshold_low": 90
}
```

#### Sensor Type อื่น ๆ
```json
{
  "threshold": {
    "min": 0,
    "max": 100
  }
}
```

## API Endpoints

### GET /notification-setting
ดึงข้อมูล notification setting ทั้งหมด

### GET /notification-setting/:id
ดึงข้อมูล notification setting ตาม ID

### GET /notification-setting/patient/:patient_id
ดึงข้อมูล notification setting ทั้งหมดของผู้ป่วยคนหนึ่ง

### GET /notification-setting/patient/:patient_id/sensor-type/:sensor_type_id
ดึงข้อมูล notification setting เฉพาะ sensor type ของผู้ป่วย

### POST /notification-setting
สร้าง notification setting ใหม่

### PATCH /notification-setting/:id
อัปเดต notification setting

### DELETE /notification-setting/:id
ลบ notification setting

## การใช้งาน

### สร้าง Patient ใหม่
เมื่อสร้าง patient ใหม่ผ่าน `POST /patient` ระบบจะ:
1. สร้าง patient record
2. ค้นหา sensor types ทั้งหมดในระบบ
3. สร้าง notification setting เริ่มต้นสำหรับแต่ละ sensor type

### ลบ Patient
เมื่อลบ patient ระบบจะ:
1. ลบรูปภาพ (ถ้ามี)
2. ลบ notification settings ทั้งหมดของ patient
3. ลบ patient record

## ตัวอย่างการทำงาน

### 1. สร้าง Patient ใหม่
```javascript
// POST /patient
{
  "name": "John Doe",
  "birthDate": "1990-01-01",
  "status": 1,
  "telFam": "0123456789",
  "sex": "M",
  "remark": "",
  "room_id": 1,
  "floor_id": 1,
  "bed_id": 1,
  "admitDate": "2025-01-01"
}

// ระบบจะสร้าง notification settings อัตโนมัติ
// สำหรับทุก sensor type ที่มีในระบบ
```

### 2. ดูการตั้งค่าของผู้ป่วย
```javascript
// GET /notification-setting/patient/1
[
  {
    "id": 1,
    "patient_id": 1,
    "sensor_type_id": 1,
    "enabled": true,
    "config": {
      "threshold": { "min": 0, "max": 100 },
      "alertDelay": 30,
      "notifications": {
        "email": true,
        "sms": false,
        "push": true
      }
    }
  },
  // ... อื่น ๆ สำหรับ sensor type อื่น
]
```

### 3. อัปเดตการตั้งค่า
```javascript
// PATCH /notification-setting/1
{
  "enabled": false,
  "config": {
    "threshold": { "min": 10, "max": 90 },
    "alertDelay": 60,
    "notifications": {
      "email": false,
      "sms": true,
      "push": true
    }
  }
}
```
