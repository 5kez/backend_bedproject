export class CreateSensorAlertDto {
  patient_id: number;
  patient_name: string;
  sensor_type_id: number;
  sensor_type_name: string;
  alertType: string;
  sensorValue: number;
  threshold?: { threshold_low?: number; threshold_high?: number } | null;
  user_id?: number;
}
