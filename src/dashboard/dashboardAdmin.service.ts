import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Sensor } from 'src/sensor/entities/sensor.entity';
import { User } from 'src/user/entities/user.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { HistoryNotification } from 'src/history_notification/entities/history_notification.entity';
import { BedSensorStatus } from 'src/bed/entities/bed-sensor.entity';

function normalizeType(raw: string | null | undefined): string {
  const k = (raw ?? '').trim().toLowerCase();
  if (k === 'spo2' || k === 'sp02' || k === 'spo₂') return 'SpO2';
  if (k === 'bedsensor' || k === 'bed') return 'BedSensor';
  if (k === 'heartrate' || k === 'hr' || k === 'heart rate') return 'HeartRate';
  if (!k) return 'Unknown';
  // default: Capitalize first letter
  return raw![0].toUpperCase() + raw!.slice(1);
}

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(HistoryNotification)
    private readonly hnRepo: Repository<HistoryNotification>,
    @InjectRepository(Patient)
    private readonly patientRepo: Repository<Patient>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getStats() {
    try {
      const [
        totalSensors,
        sensorsOnline,
        usersCount,
        patientCount,
        notificationsCount,
      ] = await Promise.all([
        this.sensorRepo.count(),
        this.sensorRepo
          .createQueryBuilder('s')
          .where('s.bed_id IS NOT NULL')
          .getCount(),
        this.userRepo.count(),
        this.patientRepo.count(),
        this.hnRepo.count(),
      ]);

      return {
        patientCount,
        sensorsOnline,
        totalSensors,
        usersCount,
        notificationsCount,
      };
    } catch {
      // กันพังและส่ง 0 แทน
      return {
        patientCount: 0,
        sensorsOnline: 0,
        totalSensors: 0,
        usersCount: 0,
        notificationsCount: 0,
      };
    }
  }

  // ✅ พาย: เซ็นเซอร์ว่าง vs ใช้งานแล้ว
  async getSensorUsagePie() {
    try {
      const row = await this.sensorRepo
        .createQueryBuilder('s')
        .select(
          'SUM(CASE WHEN s.bed_id IS NOT NULL THEN 1 ELSE 0 END)',
          'assigned',
        )
        .addSelect(
          'SUM(CASE WHEN s.bed_id IS NULL THEN 1 ELSE 0 END)',
          'unassigned',
        )
        .getRawOne<{ assigned: string; unassigned: string }>();

      return {
        assigned: Number(row?.assigned ?? 0),
        unassigned: Number(row?.unassigned ?? 0),
      };
    } catch {
      return { assigned: 0, unassigned: 0 };
    }
  }

  async getNotificationsPerDay(days = 7) {
    try {
      const rows = await this.hnRepo
        .createQueryBuilder('h')
        .select("DATE_FORMAT(h.Noti_time, '%Y-%m-%d')", 'd')
        .addSelect('h.Noti_type', 'type')
        .addSelect('COUNT(*)', 'cnt')
        .where('h.Noti_time >= CURDATE() - INTERVAL :days DAY', { days })
        .groupBy('d')
        .addGroupBy('type')
        .orderBy('d', 'ASC')
        .getRawMany<{ d: string; type: string; cnt: string }>();

      const labels: string[] = [];
      for (let i = days; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        labels.push(d.toISOString().slice(0, 10));
      }

      const typesSet = new Set<string>();
      for (const r of rows) typesSet.add(normalizeType(r.type));
      const types = Array.from(typesSet).sort();

      const series: Record<string, number[]> = {};
      for (const t of types)
        series[t] = new Array<number>(labels.length).fill(0);

      const labelIndex = new Map(labels.map((d, i) => [d, i]));
      for (const r of rows) {
        const key = normalizeType(r.type);
        const idx = labelIndex.get(r.d);
        if (idx !== undefined) {
          series[key][idx] = Number(r.cnt ?? 0);
        }
      }

      return { labels, series };
    } catch {
      return { labels: [], series: {} };
    }
  }

  async getNotificationsPerHour(days = 7) {
    try {
      const rows = await this.hnRepo
        .createQueryBuilder('h')
        .select("DATE_FORMAT(h.Noti_time, '%Y-%m-%d %H:00')", 'hr')
        .addSelect('h.Noti_type', 'type')
        .addSelect('COUNT(*)', 'cnt')
        .where('h.Noti_time >= CURDATE() - INTERVAL :days DAY', { days })
        .groupBy('hr')
        .addGroupBy('type')
        .orderBy('hr', 'ASC')
        .getRawMany<{ hr: string; type: string; cnt: string }>();

      // — labels: ชั่วโมงที่มีข้อมูลจริง เรียงเวลา
      const labels = Array.from(new Set(rows.map((r) => r.hr))).sort();

      // — types: ชนิดหลัง normalize
      const types = Array.from(
        new Set(rows.map((r) => normalizeType(r.type))),
      ).sort();

      // — เตรียม series เติม 0 ให้ครบทุกชั่วโมง
      const series: Record<string, number[]> = {};
      for (const t of types)
        series[t] = new Array<number>(labels.length).fill(0);

      // — map index เพื่ออัดค่าถูกช่อง
      const labelIndex = new Map(labels.map((l, i) => [l, i]));
      for (const r of rows) {
        const idx = labelIndex.get(r.hr);
        if (idx !== undefined) {
          const key = normalizeType(r.type);
          series[key][idx] = Number(r.cnt ?? 0);
        }
      }

      return { labels, series };
    } catch {
      return { labels: [], series: {} };
    }
  }

  private formatDateOnly(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatHourBucket(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hour = `${date.getHours()}`.padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:00`;
  }

  private formatMonthBucket(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
  }

  private formatYearBucket(date: Date): string {
    return `${date.getFullYear()}`;
  }

  private determineSignalGranularity(
    start: Date,
    end: Date,
  ): 'day' | 'month' | 'year' {
    const diffMs = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const monthsDiff =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    let granularity: 'day' | 'month' | 'year' = 'day';
    if (diffDays > 30) {
      granularity = 'month';
    }
    if (monthsDiff > 12) {
      granularity = 'year';
    }

    return granularity;
  }

  private buildSignalLabels(
    start: Date,
    end: Date,
    granularity: 'hour' | 'day' | 'month' | 'year',
  ): string[] {
    const labels: string[] = [];
    if (granularity === 'hour') {
      for (
        let cursor = new Date(start);
        cursor < end;
        cursor.setHours(cursor.getHours() + 1)
      ) {
        labels.push(this.formatHourBucket(cursor));
      }
      return labels;
    }

    if (granularity === 'day') {
      for (
        let cursor = new Date(start);
        cursor < end;
        cursor.setDate(cursor.getDate() + 1)
      ) {
        labels.push(this.formatDateOnly(cursor));
      }
      return labels;
    }

    if (granularity === 'month') {
      const cursor = new Date(start);
      cursor.setDate(1);
      while (cursor < end) {
        labels.push(this.formatMonthBucket(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
      }
      return labels;
    }

    const cursor = new Date(start);
    cursor.setMonth(0, 1);
    while (cursor < end) {
      labels.push(this.formatYearBucket(cursor));
      cursor.setFullYear(cursor.getFullYear() + 1);
    }
    return labels;
  }

  async getNotificationCategoryComparison(options?: {
    deptBuildingId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const now = new Date();
    const past = new Date(now);
    past.setDate(now.getDate() - 7);
    const defaultStart = this.formatDateOnly(past);

    const startDate = options?.startDate || defaultStart;
    const endDate =
      options?.endDate ||
      this.formatDateOnly(
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      );

    try {
      const qb = this.hnRepo
        .createQueryBuilder('hn')
        .select(
          `CASE
            WHEN hn.Noti_desc LIKE :disconnectPattern THEN 'Disconnect'
            WHEN hn.Noti_type IS NOT NULL AND TRIM(hn.Noti_type) <> '' THEN hn.Noti_type
            ELSE 'Other'
          END`,
          'noti_category',
        )
        .addSelect('COUNT(*)', 'alerts')
        .innerJoin(Patient, 'p', 'p.patient_id = hn.Patient_Id')
        .innerJoin('bed', 'b', 'b.bed_id = p.bed_id')
        .innerJoin(
          'department_building',
          'db',
          'db.department_building_id = b.department_building_id',
        )
        .where('hn.Noti_time >= :startDate', { startDate })
        .andWhere('hn.Noti_time < :endDate', { endDate })
        .setParameter('disconnectPattern', '%หลุดการเชื่อมต่อ%');

      if (options?.deptBuildingId && options.deptBuildingId > 0) {
        qb.andWhere('db.department_building_id = :deptBuildingId', {
          deptBuildingId: options.deptBuildingId,
        });
      }

      const rows = await qb
        .groupBy('noti_category')
        .orderBy('alerts', 'DESC')
        .getRawMany<{ noti_category: string | null; alerts: string }>();

      const labels: string[] = [];
      const values: number[] = [];
      let total = 0;

      for (const row of rows) {
        const label = normalizeType(row.noti_category ?? 'Other');
        const count = Number(row.alerts ?? 0);
        labels.push(label);
        values.push(count);
        total += count;
      }

      return { labels, values, total, startDate, endDate };
    } catch {
      return { labels: [], values: [], total: 0, startDate, endDate };
    }
  }

  async getNotificationSignalVolume(options?: {
    deptBuildingId?: number;
    startDate?: string;
    endDate?: string;
    granularity?: 'hour' | 'day' | 'month' | 'year';
  }) {
    const now = new Date();
    const past = new Date(now);
    past.setDate(now.getDate() - 7);
    const defaultStart = this.formatDateOnly(past);
    const defaultEnd = this.formatDateOnly(
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
    );

    const startDate = options?.startDate || defaultStart;
    const endDate = options?.endDate || defaultEnd;

    try {
      const startObj = new Date(`${startDate}T00:00:00`);
      const endObj = new Date(`${endDate}T00:00:00`);
      const allowedGranularities = new Set(['hour', 'day', 'month', 'year']);

      let granularity: 'hour' | 'day' | 'month' | 'year';
      if (
        options?.granularity &&
        allowedGranularities.has(options.granularity)
      ) {
        granularity = options.granularity;
      } else {
        granularity = this.determineSignalGranularity(startObj, endObj);
      }

      const sqlFormatMap: Record<'hour' | 'day' | 'month' | 'year', string> = {
        hour: '%Y-%m-%d %H:00',
        day: '%Y-%m-%d',
        month: '%Y-%m',
        year: '%Y',
      };
      const sqlFormat = sqlFormatMap[granularity];

      const qb = this.hnRepo
        .createQueryBuilder('hn')
        .select(`DATE_FORMAT(hn.Noti_time, '${sqlFormat}')`, 'bucket')
        .addSelect('hn.Noti_type', 'noti_type')
        .addSelect('COUNT(*)', 'cnt')
        .innerJoin(Patient, 'p', 'p.patient_id = hn.Patient_Id')
        .innerJoin('bed', 'b', 'b.bed_id = p.bed_id')
        .innerJoin(
          'department_building',
          'db',
          'db.department_building_id = b.department_building_id',
        )
        .where('hn.Noti_time >= :startDate', { startDate })
        .andWhere('hn.Noti_time < :endDate', { endDate });

      if (options?.deptBuildingId && options.deptBuildingId > 0) {
        qb.andWhere('db.department_building_id = :deptBuildingId', {
          deptBuildingId: options.deptBuildingId,
        });
      }

      const rows = await qb
        .groupBy('bucket')
        .addGroupBy('noti_type')
        .orderBy('bucket', 'ASC')
        .getRawMany<{
          bucket: string;
          noti_type: string | null;
          cnt: string;
        }>();

      const primaryTypes = ['HeartRate', 'SpO2', 'BedSensor'] as const;
      const fallbackType = 'Other';

      const observedTypes = new Set<string>();
      for (const row of rows) {
        const normalized = normalizeType(row.noti_type);
        if (
          primaryTypes.includes(normalized as (typeof primaryTypes)[number])
        ) {
          observedTypes.add(normalized);
        } else {
          observedTypes.add(fallbackType);
        }
      }

      const labels = this.buildSignalLabels(startObj, endObj, granularity);

      const types = Array.from(
        new Set<string>([
          ...primaryTypes,
          ...Array.from(observedTypes.values()),
        ]),
      );

      const series: Record<string, number[]> = {};
      const totals: Record<string, number> = {};

      for (const type of types) {
        series[type] = new Array<number>(labels.length).fill(0);
        totals[type] = 0;
      }

      const labelIndex = new Map(labels.map((label, idx) => [label, idx]));
      for (const row of rows) {
        const targetLabel = row.bucket;
        const idx = labelIndex.get(targetLabel);
        if (idx === undefined) continue;
        const normalized = normalizeType(row.noti_type);
        const type = primaryTypes.includes(
          normalized as (typeof primaryTypes)[number],
        )
          ? normalized
          : fallbackType;
        const cnt = Number(row.cnt ?? 0);
        series[type][idx] += cnt;
        totals[type] = (totals[type] ?? 0) + cnt;
      }

      // Trim series types that remain empty and not in primary set
      for (const type of Object.keys(series)) {
        if (!primaryTypes.includes(type as (typeof primaryTypes)[number])) {
          const sum = series[type].reduce((a, b) => a + b, 0);
          if (sum === 0) {
            delete series[type];
            delete totals[type];
          }
        }
      }

      return { labels, series, totals, startDate, endDate, granularity };
    } catch {
      return {
        labels: [],
        series: {},
        totals: {},
        startDate,
        endDate,
        granularity: options?.granularity ?? 'day',
      };
    }
  }

  async getSensorUsageTrend(options?: {
    months?: number;
    deptBuildingId?: number;
  }) {
    const monthsRaw = options?.months ?? 12;
    const months = Math.min(Math.max(monthsRaw, 1), 24);
    const deptBuildingId =
      options?.deptBuildingId && options.deptBuildingId > 0
        ? options.deptBuildingId
        : null;

    const deptFilter = deptBuildingId
      ? ' AND b.department_building_id = ?'
      : '';

    const sql = `
      WITH RECURSIVE month_series AS (
        SELECT DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL ? - 1 MONTH), '%Y-%m-01') AS month_start
        UNION ALL
        SELECT DATE_ADD(month_start, INTERVAL 1 MONTH)
        FROM month_series
        WHERE month_start < DATE_FORMAT(CURDATE(), '%Y-%m-01')
      )
      SELECT
        DATE_FORMAT(ms.month_start, '%Y-%m') AS label,
        COALESCE(installs.cnt, 0) AS installations,
        COALESCE(maint.cnt, 0) AS maintenances,
        COALESCE(issues.cnt, 0) AS issues
      FROM month_series ms
      LEFT JOIN (
        SELECT DATE_FORMAT(bs.installation_date, '%Y-%m') AS bucket, COUNT(*) AS cnt
        FROM bed_sensors bs
        JOIN bed b ON b.bed_id = bs.bed_id
        WHERE bs.installation_date IS NOT NULL
          AND bs.installation_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
          ${deptFilter}
        GROUP BY bucket
      ) installs ON installs.bucket = DATE_FORMAT(ms.month_start, '%Y-%m')
      LEFT JOIN (
        SELECT DATE_FORMAT(bs.last_maintenance, '%Y-%m') AS bucket, COUNT(*) AS cnt
        FROM bed_sensors bs
        JOIN bed b ON b.bed_id = bs.bed_id
        WHERE bs.last_maintenance IS NOT NULL
          AND bs.last_maintenance >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
          ${deptFilter}
        GROUP BY bucket
      ) maint ON maint.bucket = DATE_FORMAT(ms.month_start, '%Y-%m')
      LEFT JOIN (
        SELECT DATE_FORMAT(bs.updated_at, '%Y-%m') AS bucket, COUNT(*) AS cnt
        FROM bed_sensors bs
        JOIN bed b ON b.bed_id = bs.bed_id
        WHERE bs.updated_at IS NOT NULL
          AND bs.updated_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
          AND bs.status IN (?, ?, ?)
          ${deptFilter}
        GROUP BY bucket
      ) issues ON issues.bucket = DATE_FORMAT(ms.month_start, '%Y-%m')
      ORDER BY ms.month_start;
    `;

    const params: Array<number | string> = [months];

    const pushSubQueryParams = () => {
      params.push(months);
      if (deptBuildingId) params.push(deptBuildingId);
    };

    pushSubQueryParams(); // installations
    pushSubQueryParams(); // maintenance
    params.push(months);
    params.push(
      BedSensorStatus.INACTIVE,
      BedSensorStatus.MAINTENANCE,
      BedSensorStatus.ERROR,
    );
    if (deptBuildingId) params.push(deptBuildingId);

    const rows = await this.dataSource.query<
      {
        label: string;
        installations: string;
        maintenances: string;
        issues: string;
      }[]
    >(sql, params);

    const labels = rows.map((r) => r.label);

    const series = {
      Installations: rows.map((r) => Number(r.installations ?? 0)),
      Maintenances: rows.map((r) => Number(r.maintenances ?? 0)),
      Issues: rows.map((r) => Number(r.issues ?? 0)),
    };

    const totals = {
      Installations: series.Installations.reduce((a, b) => a + b, 0),
      Maintenances: series.Maintenances.reduce((a, b) => a + b, 0),
      Issues: series.Issues.reduce((a, b) => a + b, 0),
    };

    return { labels, series, totals, months };
  }
}
