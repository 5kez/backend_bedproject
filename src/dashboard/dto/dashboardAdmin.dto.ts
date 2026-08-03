import { ApiProperty } from '@nestjs/swagger';

export class AdminStatsDto {
  @ApiProperty({ example: 42 })
  patientCount: number;

  @ApiProperty({ example: 18 })
  sensorsOnline: number;

  @ApiProperty({ example: 25 })
  totalSensors: number;

  @ApiProperty({ example: 12 })
  usersCount: number;

  @ApiProperty({ example: 320 })
  notificationsCount: number;
}

export class SensorStatusDto {
  @ApiProperty({ example: 18 })
  assigned: number;

  @ApiProperty({ example: 7 })
  unassigned: number;
}

export class NotificationChartResponseDto {
  @ApiProperty({ type: [String], example: ['2025-10-01', '2025-10-02'] })
  labels: string[];

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'number' },
    },
    example: { HeartRate: [3, 2], SpO2: [1, 0] },
  })
  series: Record<string, number[]>;
}

export class NotificationTypeDto {
  @ApiProperty({ example: '2025-10-08' })
  date: string;

  @ApiProperty({ example: 'HeartRate' })
  noti_type: string;

  @ApiProperty({ example: 5 })
  cnt: number;
}

export class NotificationTrendDto {
  @ApiProperty({ example: '2025-10-08 10:00' })
  hour: string;

  @ApiProperty({ example: 'HeartRate' })
  noti_type: string;

  @ApiProperty({ example: 3 })
  cnt: number;
}

export class NotificationCategoryComparisonResponseDto {
  @ApiProperty({ type: [String], example: ['Disconnect', 'HeartRate'] })
  labels: string[];

  @ApiProperty({ type: [Number], example: [15, 9] })
  values: number[];

  @ApiProperty({ example: 24 })
  total: number;

  @ApiProperty({ example: '2025-10-01' })
  startDate: string;

  @ApiProperty({ example: '2025-10-08' })
  endDate: string;
}

export class NotificationSignalVolumeResponseDto {
  @ApiProperty({ type: [String], example: ['2025-10-01', '2025-10-02'] })
  labels: string[];

  @ApiProperty({
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'number' },
    },
    example: { HeartRate: [2, 4], SpO2: [1, 3] },
  })
  series: Record<string, number[]>;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { HeartRate: 12, SpO2: 6 },
  })
  totals: Record<string, number>;

  @ApiProperty({ example: '2025-10-01' })
  startDate: string;

  @ApiProperty({ example: '2025-10-08' })
  endDate: string;

  @ApiProperty({ enum: ['hour', 'day', 'month', 'year'], example: 'day' })
  granularity: 'hour' | 'day' | 'month' | 'year';
}

export class SensorUsageTrendSeriesDto {
  @ApiProperty({ type: [Number], example: [2, 4, 3] })
  Installations: number[];

  @ApiProperty({ type: [Number], example: [1, 2, 2] })
  Maintenances: number[];

  @ApiProperty({ type: [Number], example: [0, 1, 1] })
  Issues: number[];
}

export class SensorUsageTrendResponseDto {
  @ApiProperty({ type: [String], example: ['2025-08', '2025-09', '2025-10'] })
  labels: string[];

  @ApiProperty({ type: SensorUsageTrendSeriesDto })
  series: SensorUsageTrendSeriesDto;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'number' },
    example: { Installations: 12, Maintenances: 5, Issues: 3 },
  })
  totals: Record<string, number>;

  @ApiProperty({ example: 12, description: 'จำนวนเดือนที่รวมอยู่ในการคำนวณ' })
  months: number;
}
