import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, DataSource, FindOptionsWhere } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Patient } from 'src/patient/entities/patient.entity';
import { Bed } from 'src/bed/entities/bed.entity';
import { NotificationHistory } from 'src/bed/entities/notification-history.entity';
import { HistoryNotification } from 'src/history_notification/entities/history_notification.entity';

type DashboardScope = {
  siteId: number;
  departmentId?: number;
  floorId?: number;
  buildingId?: number;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
    @InjectRepository(Bed)
    private bedRepo: Repository<Bed>,
    @InjectRepository(NotificationHistory)
    private notificationRepo: Repository<NotificationHistory>,
    @InjectRepository(HistoryNotification)
    private hnRepo: Repository<HistoryNotification>,
    private dataSource: DataSource,
  ) {}

  private buildScope(user: User, siteWide: boolean): DashboardScope {
    return {
      siteId: user.site_id,
      departmentId:
        !siteWide && user.department_id ? user.department_id : undefined,
      floorId: undefined, // ปิดการกรองตาม floor เพราะระบบใช้ floor_number แทน floor_id แล้ว
      buildingId: !siteWide && user.build_id ? user.build_id : undefined,
    };
  }

  private buildRawScopeClause(
    scope: DashboardScope,
    aliases: {
      patientAlias?: string;
      deptBuildingAlias?: string;
      buildingAlias?: string;
    },
  ): { clause: string; params: Array<number> } {
    const clauses: string[] = [];
    const params: number[] = [];

    if (aliases.patientAlias) {
      clauses.push(`${aliases.patientAlias}.site_id = ?`);
      params.push(scope.siteId);
    } else if (aliases.buildingAlias) {
      clauses.push(`${aliases.buildingAlias}.site_id = ?`);
      params.push(scope.siteId);
    }

    if (scope.departmentId) {
      if (aliases.patientAlias) {
        clauses.push(`${aliases.patientAlias}.department_id = ?`);
      } else if (aliases.deptBuildingAlias) {
        clauses.push(`${aliases.deptBuildingAlias}.department_id = ?`);
      }
      params.push(scope.departmentId);
    }

    if (scope.floorId) {
      if (aliases.patientAlias) {
        clauses.push(`${aliases.patientAlias}.floor_id = ?`);
      } else if (aliases.deptBuildingAlias) {
        clauses.push(`${aliases.deptBuildingAlias}.floor_id = ?`);
      }
      params.push(scope.floorId);
    }

    if (scope.buildingId && aliases.buildingAlias) {
      clauses.push(
        `(${aliases.buildingAlias}.building_id = ? OR ${aliases.buildingAlias}.building_id IS NULL)`,
      );
      params.push(scope.buildingId);
    }

    return { clause: clauses.join(' AND '), params };
  }

  async getStats(username: string, siteWide = false) {
    const user = await this.userRepo.findOne({
      where: { user_name: username },
    });
    if (!user)
      return {
        patientCount: 0,
        availableBeds: 0,
        totalBeds: 0,
        notifications: 0,
        completedPatients: 0,
      };

    const scope = this.buildScope(user, siteWide);

    // --- Patient Count ---
    const patientWhere: FindOptionsWhere<Patient> = {
      status: 1,
      site_id: scope.siteId,
    };
    if (scope.departmentId) patientWhere.department_id = scope.departmentId;
    if (scope.floorId) patientWhere.floor_id = scope.floorId;

    const patientCount = await this.patientRepo.count({ where: patientWhere });

    // --- Total Beds ---
    const totalBedsQuery = this.bedRepo
      .createQueryBuilder('b')
      .leftJoin('b.departmentBuilding', 'db')
      .leftJoin('db.building', 'bb')
      .where('bb.site_id = :siteId', { siteId: scope.siteId });

    if (scope.buildingId) {
      totalBedsQuery.andWhere('bb.building_id = :buildId', {
        buildId: scope.buildingId,
      });
    }
    if (scope.departmentId) {
      totalBedsQuery.andWhere('db.department_id = :deptId', {
        deptId: scope.departmentId,
      });
    }
    if (scope.floorId) {
      totalBedsQuery.andWhere('db.floor_number = :floorId', {
        floorId: scope.floorId,
      });
    }

    const totalBeds = await totalBedsQuery.getCount();

    // --- Occupied Beds ---
    const occupiedBedsQuery = this.bedRepo
      .createQueryBuilder('b')
      .leftJoin('b.departmentBuilding', 'db')
      .leftJoin('db.building', 'bb')
      .where('bb.site_id = :siteId', { siteId: scope.siteId })
      .andWhere('b.patient_id IS NOT NULL');

    if (scope.buildingId) {
      occupiedBedsQuery.andWhere('bb.building_id = :buildId', {
        buildId: scope.buildingId,
      });
    }
    if (scope.departmentId) {
      occupiedBedsQuery.andWhere('db.department_id = :deptId', {
        deptId: scope.departmentId,
      });
    }
    if (scope.floorId) {
      occupiedBedsQuery.andWhere('db.floor_number = :floorId', {
        floorId: scope.floorId,
      });
    }

    const occupiedBeds = await occupiedBedsQuery.getCount();

    // --- Notifications ---
    const notificationsQuery = this.hnRepo
      .createQueryBuilder('h')
      .innerJoin(Patient, 'p', 'p.patient_id = h.Patient_Id')
      .leftJoin(Bed, 'nb', 'nb.bed_id = p.bed_id')
      .leftJoin('nb.departmentBuilding', 'ndb')
      .leftJoin('ndb.building', 'nbl')
      .where('p.site_id = :siteId', { siteId: scope.siteId });

    if (scope.departmentId) {
      notificationsQuery.andWhere('p.department_id = :deptId', {
        deptId: scope.departmentId,
      });
    }
    if (scope.floorId) {
      notificationsQuery.andWhere('p.floor_id = :floorId', {
        floorId: scope.floorId,
      });
    }
    if (scope.buildingId) {
      notificationsQuery.andWhere('nbl.building_id = :buildId', {
        buildId: scope.buildingId,
      });
    }

    const notificationsCount = await notificationsQuery.getCount();

    // --- Completed Patients ---
    const completedWhere: FindOptionsWhere<Patient> = {
      status: Not(1),
      site_id: scope.siteId,
    };
    if (scope.departmentId) completedWhere.department_id = scope.departmentId;
    if (scope.floorId) completedWhere.floor_id = scope.floorId;

    const completedPatients = await this.patientRepo.count({
      where: completedWhere,
    });

    return {
      patientCount,
      availableBeds: totalBeds - occupiedBeds,
      totalBeds,
      notifications: notificationsCount,
      completedPatients,
    };
  }

  async getGenderChart(username: string, siteWide = false) {
    const user = await this.userRepo.findOne({
      where: { user_name: username },
    });
    if (!user) return [];
    const scope = this.buildScope(user, siteWide);

    const query = this.patientRepo
      .createQueryBuilder('p')
      .select(
        `CASE
      WHEN p.sex = 'M' THEN 'ชาย'
      WHEN p.sex = 'F' THEN 'หญิง'
      ELSE 'ไม่ระบุ'
    END`,
        'gender_label',
      )
      .addSelect('COUNT(*)', 'patient')
      .where('p.status = 1')
      .andWhere('p.site_id = :siteId', { siteId: scope.siteId });

    if (scope.departmentId) {
      query.andWhere('p.department_id = :deptId', {
        deptId: scope.departmentId,
      });
    }
    if (scope.floorId) {
      query.andWhere('p.floor_id = :floorId', { floorId: scope.floorId });
    }

    query.groupBy('gender_label');

    const result = await query.getRawMany<{
      gender_label: string;
      patient: number | string;
    }>();
    return result.map((r) => ({
      gender_label: r.gender_label,
      patient: Number(r.patient),
    }));
  }

  async getAgeGroups(
    username: string,
    siteWide = false,
  ): Promise<
    { department_name?: string; age_band: string; patients: number | string }[]
  > {
    const user = await this.userRepo.findOne({
      where: { user_name: username },
    });
    if (!user) return [];
    const scope = this.buildScope(user, siteWide);

    const ageBandCase = `
      CASE
        WHEN TIMESTAMPDIFF(YEAR, p.birthDate, CURDATE()) IS NULL THEN 'ไม่ทราบ'
        WHEN TIMESTAMPDIFF(YEAR, p.birthDate, CURDATE()) BETWEEN 0 AND 17 THEN '0-17'
        WHEN TIMESTAMPDIFF(YEAR, p.birthDate, CURDATE()) BETWEEN 18 AND 29 THEN '18-29'
        WHEN TIMESTAMPDIFF(YEAR, p.birthDate, CURDATE()) BETWEEN 30 AND 44 THEN '30-44'
        WHEN TIMESTAMPDIFF(YEAR, p.birthDate, CURDATE()) BETWEEN 45 AND 59 THEN '45-59'
        WHEN TIMESTAMPDIFF(YEAR, p.birthDate, CURDATE()) BETWEEN 60 AND 74 THEN '60-74'
        ELSE '75+'
      END
    `;

    const query = this.patientRepo
      .createQueryBuilder('p')
      .where('p.status = 1')
      .andWhere('p.site_id = :siteId', { siteId: scope.siteId });

    if (scope.departmentId) {
      query.andWhere('p.department_id = :deptId', {
        deptId: scope.departmentId,
      });
    }
    if (scope.floorId) {
      query.andWhere('p.floor_id = :floorId', { floorId: scope.floorId });
    }

    if (siteWide) {
      query.select(ageBandCase, 'age_band').addSelect('COUNT(*)', 'patients');
      query.groupBy('age_band');
    } else {
      query
        .innerJoin('p.department', 'd')
        .select('d.department_name', 'department_name')
        .addSelect(ageBandCase, 'age_band')
        .addSelect('COUNT(*)', 'patients')
        .groupBy('d.department_name')
        .addGroupBy('age_band');
    }

    return query.getRawMany<{
      department_name?: string;
      age_band: string;
      patients: number | string;
    }>();
  }

  async getAdmitTrend(
    username: string,
    days = 30,
    siteMode = false,
  ): Promise<{ date: string; cnt: number }[]> {
    const user = await this.userRepo.findOne({
      where: { user_name: username },
    });
    if (!user) return [];

    const scope = this.buildScope(user, siteMode);
    const { clause: areaClause, params: areaParams } = this.buildRawScopeClause(
      scope,
      { patientAlias: 'p', deptBuildingAlias: 'db', buildingAlias: 'bl' },
    );
    const filterClause = areaClause ? `AND ${areaClause}` : '';

    const params = [days, days, ...areaParams];

    const query = `
  WITH RECURSIVE dates AS (
    SELECT CAST(CURDATE() - INTERVAL ? DAY AS DATE) AS d
    UNION ALL
    SELECT d + INTERVAL 1 DAY FROM dates WHERE d < CURDATE()
  ),
  in_daily AS (
    SELECT DATE(hp.in_date) AS d, COUNT(*) AS cnt
    FROM history_patient hp
    JOIN patient p ON p.patient_id = hp.patient_id
    LEFT JOIN bed b ON b.bed_id = p.bed_id
    LEFT JOIN department_building db ON db.department_building_id = b.department_building_id
    LEFT JOIN building bl ON bl.building_id = db.building_id
    WHERE hp.in_date >= CURDATE() - INTERVAL ? DAY
      AND hp.in_date < CURDATE() + INTERVAL 1 DAY
      ${filterClause ? `  ${filterClause}` : ''}
    GROUP BY DATE(hp.in_date)
  )
  SELECT
    d.d AS date,
    COALESCE(i.cnt, 0) AS cnt
  FROM dates d
  LEFT JOIN in_daily i ON i.d = d.d
  ORDER BY d.d;
  `;

    return this.dataSource.query<{ date: string; cnt: number }[]>(
      query,
      params,
    );
  }

  async getPatientInOutTrend(
    username: string,
    deptBuildingId: number,
    siteMode: boolean,
  ): Promise<
    { day: string; admits: number | string; discharges: number | string }[]
  > {
    const user = await this.userRepo.findOne({
      where: { user_name: username },
    });
    if (!user) {
      return [];
    }

    const scope = this.buildScope(user, siteMode);
    const scopeInfo = this.buildRawScopeClause(scope, {
      patientAlias: 'p',
      deptBuildingAlias: 'db',
      buildingAlias: 'bl',
    });

    const extraConditions: string[] = [];
    const sharedParams: number[] = [];
    if (scopeInfo.clause) {
      sharedParams.push(...scopeInfo.params);
      extraConditions.push(scopeInfo.clause);
    }

    if (!siteMode && deptBuildingId > 0) {
      const deptRows = await this.dataSource.query<
        { department_id: number; floor_id: number | null }[]
      >(
        `SELECT department_id, floor_id
         FROM department_building
         WHERE department_building_id = ?
         LIMIT 1`,
        [deptBuildingId],
      );
      if (!deptRows.length) {
        return [];
      }
      const targetDept = deptRows[0];

      const deptConditionParts = [
        '(db.department_building_id = ?)',
        'OR (db.department_building_id IS NULL AND p.department_id = ?',
      ];
      sharedParams.push(deptBuildingId, targetDept.department_id);
      // patient has no floor_number column - match on floor_id instead
      // (this used to fail with "Unknown column 'p.floor_number'").
      if (targetDept.floor_id !== null) {
        deptConditionParts.push('AND p.floor_id = ?');
        sharedParams.push(targetDept.floor_id);
      }
      deptConditionParts.push(')');
      const deptCondition = deptConditionParts.join(' ');
      extraConditions.push(`(${deptCondition})`);
    }

    const mergedConditions =
      extraConditions.length > 0
        ? '      AND ' + extraConditions.join('\n      AND ')
        : '';

    const params = [...sharedParams, ...sharedParams];

    const query = `
  WITH RECURSIVE dates AS (
    SELECT CAST(CURDATE() - INTERVAL 30 DAY AS DATE) AS d
    UNION ALL
    SELECT d + INTERVAL 1 DAY FROM dates WHERE d < CURDATE()
  ),
  in_daily AS (
    SELECT DATE(hp.in_date) AS d, COUNT(*) AS cnt
    FROM history_patient hp
    JOIN patient p ON p.patient_id = hp.patient_id
    LEFT JOIN bed b ON b.bed_id = p.bed_id
    LEFT JOIN department_building db ON db.department_building_id = b.department_building_id
    LEFT JOIN building bl ON bl.building_id = db.building_id
    WHERE hp.in_date >= CURDATE() - INTERVAL 30 DAY
      AND hp.in_date < CURDATE() + INTERVAL 1 DAY
      ${mergedConditions}
    GROUP BY DATE(hp.in_date)
  ),
  out_daily AS (
    SELECT DATE(hp.out_date) AS d, COUNT(*) AS cnt
    FROM history_patient hp
    JOIN patient p ON p.patient_id = hp.patient_id
    LEFT JOIN bed b ON b.bed_id = p.bed_id
    LEFT JOIN department_building db ON db.department_building_id = b.department_building_id
    LEFT JOIN building bl ON bl.building_id = db.building_id
    WHERE hp.out_date >= CURDATE() - INTERVAL 30 DAY
      AND hp.out_date < CURDATE() + INTERVAL 1 DAY
      ${mergedConditions}
    GROUP BY DATE(hp.out_date)
  )
  SELECT
    d.d AS day,
    COALESCE(i.cnt, 0) AS admits,
    COALESCE(o.cnt, 0) AS discharges
  FROM dates d
  LEFT JOIN in_daily i ON i.d = d.d
  LEFT JOIN out_daily o ON o.d = d.d
  ORDER BY d.d;
  `;

    return this.dataSource.query<
      { day: string; admits: number | string; discharges: number | string }[]
    >(query, params);
  }

  async getNotificationAlertTrend(
    username: string,
    siteMode: boolean,
  ): Promise<
    {
      alert_date: string;
      bed_name: string;
      top_sensor: string;
      top_sensor_alerts: number;
      total_alerts: number;
    }[]
  > {
    const params = [username];
    const query = `
  WITH daily_alerts AS (
    SELECT
      DATE(hn.Noti_time) AS alert_date,
      b.bed_id,
      hn.Sensor_type,
      COUNT(*) AS alert_count
    FROM history_notification hn
    JOIN bed b ON b.patient_id = hn.Patient_Id
    JOIN department_building db ON db.department_building_id = b.department_building_id
    JOIN building bl ON bl.building_id = db.building_id
    JOIN \`user\` u ON u.user_name = ?
    WHERE hn.Noti_time >= CURDATE() - INTERVAL 30 DAY
      AND hn.Noti_time < CURDATE() + INTERVAL 1 DAY
      ${
        siteMode
          ? `AND bl.site_id = u.site_id`
          : `AND bl.site_id = u.site_id
             AND (u.department_id IS NULL OR db.department_id = u.department_id)
             AND (u.floor_id IS NULL OR db.floor_id = u.floor_id)
             AND (u.build_id IS NULL OR bl.building_id = u.build_id)`
      }
    GROUP BY DATE(hn.Noti_time), b.bed_id, hn.Sensor_type
  ),
  ranked AS (
    SELECT
      alert_date,
      bed_id,
      Sensor_type,
      alert_count,
      ROW_NUMBER() OVER (PARTITION BY alert_date, bed_id ORDER BY alert_count DESC) AS rn
    FROM daily_alerts
  ),
  summary AS (
    SELECT
      alert_date,
      bed_id,
      SUM(alert_count) AS total_alerts
    FROM daily_alerts
    GROUP BY alert_date, bed_id
  )
  SELECT
    r.alert_date,
    CONCAT('เตียง ', r.bed_id) AS bed_name,
    r.Sensor_type AS top_sensor,
    r.alert_count AS top_sensor_alerts,
    s.total_alerts AS total_alerts
  FROM ranked r
  JOIN summary s ON s.alert_date = r.alert_date AND s.bed_id = r.bed_id
  WHERE r.rn = 1
  ORDER BY r.alert_date, r.bed_id;
  `;
    return this.dataSource.query<
      {
        alert_date: string;
        bed_name: string;
        top_sensor: string;
        top_sensor_alerts: number;
        total_alerts: number;
      }[]
    >(query, params);
  }

  async getAvgStayTrend(
    username: string,
    siteWide = false,
  ): Promise<{ month: string; avgStayDays: number }[]> {
    const user = await this.userRepo.findOne({
      where: { user_name: username },
    });
    if (!user) return [];

    const scope = this.buildScope(user, siteWide);
    const { clause: areaClause, params: areaParams } = this.buildRawScopeClause(
      scope,
      { patientAlias: 'p', deptBuildingAlias: 'db', buildingAlias: 'bl' },
    );
    const filterClause = areaClause ? `AND ${areaClause}` : '';

    const result = await this.dataSource.query<
      { month: string; avg_stay_days: number | string }[]
    >(
      `
        SELECT
          DATE_FORMAT(hp.in_date, '%Y-%m') AS month,
          ROUND(AVG(DATEDIFF(hp.out_date, hp.in_date)), 2) AS avg_stay_days
        FROM history_patient hp
        JOIN patient p ON p.patient_id = hp.patient_id
        LEFT JOIN bed b ON b.bed_id = p.bed_id
        LEFT JOIN department_building db ON db.department_building_id = b.department_building_id
        LEFT JOIN building bl ON bl.building_id = db.building_id
        WHERE hp.out_date IS NOT NULL
          ${filterClause ? `${filterClause}` : ''}
        GROUP BY DATE_FORMAT(hp.in_date, '%Y-%m')
        ORDER BY month;
      `,
      areaParams,
    );

    return result.map((row) => ({
      month: row.month,
      avgStayDays: Number(row.avg_stay_days),
    }));
  }
}
