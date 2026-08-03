export class CreateHistoryNotificationDto {
  Patient_Id: number;
  Noti_time: Date; // ✅ เปลี่ยนจาก string เป็น Date
  Noti_type: string;
  Noti_desc: string;
  Noti_id: number;
  Noti_setting_id: number;
  Status: number;
  Sensor_id: number;
  Sensor_type: string;
  Device_id: string;
  User_id: number;
  Patient_indate: Date;
  Patient_remark: string;
  Patient_department: string;
  Patient_room_num: number;
}
