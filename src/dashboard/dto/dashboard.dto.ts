import { ApiProperty } from '@nestjs/swagger';

// สถิติรวม
export class StatsDto {
  @ApiProperty({ example: 24 })
  patientCount: number;

  @ApiProperty({ example: 8 })
  availableBeds: number;

  @ApiProperty({ example: 32 })
  totalBeds: number;

  @ApiProperty({ example: 120 })
  notifications: number;

  @ApiProperty({ example: 5 })
  completedPatients: number;
}

// Gender Chart
export class GenderRowDto {
  @ApiProperty({ example: 'ชาย' })
  gender_label: string;

  @ApiProperty({ example: 12 })
  patient: number;
}

// Age Groups
export class AgeGroupRowDto {
  @ApiProperty({ example: 'อายุรกรรม' })
  department_name: string;

  @ApiProperty({ example: '31-40' })
  age_band: string;

  @ApiProperty({ example: 4 })
  patient: number;
}

// Admit Trend
export class AdmitTrendRowDto {
  @ApiProperty({
    example: '2025-10-01',
    description: 'วันที่ในรูปแบบ YYYY-MM-DD',
  })
  date: string; // YYYY-MM-DD

  @ApiProperty({ example: 7 })
  cnt: number;
}

export class InOutTrendSeriesDto {
  @ApiProperty({ type: [Number], example: [2, 4, 3] })
  Admit: number[];

  @ApiProperty({ type: [Number], example: [1, 2, 1] })
  Discharge: number[];
}

export class InOutTrendResponseDto {
  @ApiProperty({ type: [String], example: ['2025-10-01', '2025-10-02'] })
  labels: string[];

  @ApiProperty({ type: InOutTrendSeriesDto })
  series: InOutTrendSeriesDto;
}

export class NotificationAlertTrendDto {
  @ApiProperty({ example: '2025-10-01' })
  alert_date: string;

  @ApiProperty({ example: 'เตียง 12' })
  bed_name: string;

  @ApiProperty({ example: 'HeartRate' })
  top_sensor: string;

  @ApiProperty({ example: 6 })
  top_sensor_alerts: number;

  @ApiProperty({ example: 10 })
  total_alerts: number;
}

export class AvgStayTrendDto {
  @ApiProperty({ example: '2025-10' })
  month: string;

  @ApiProperty({ example: 3.5 })
  avgStayDays: number;
}
