import { Controller, Get, Query } from '@nestjs/common';
import { AdminDashboardService } from './dashboardAdmin.service';
import {
  AdminStatsDto,
  SensorStatusDto,
  NotificationChartResponseDto,
  NotificationCategoryComparisonResponseDto,
  NotificationSignalVolumeResponseDto,
  SensorUsageTrendResponseDto,
} from './dto/dashboardAdmin.dto';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@Controller('admin-dashboard')
@ApiTags('Admin Dashboard')
export class AdminDashboardController {
  constructor(private readonly dashboardService: AdminDashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'สถิติภาพรวมสำหรับผู้ดูแลระบบ' })
  @ApiOkResponse({ type: AdminStatsDto })
  async getStats() {
    return await this.dashboardService.getStats();
  }

  @Get('sensors/pie')
  @ApiOperation({ summary: 'จำนวนเซ็นเซอร์ที่ใช้งาน/ว่าง' })
  @ApiOkResponse({ type: SensorStatusDto })
  async getSensorUsagePie() {
    return await this.dashboardService.getSensorUsagePie();
  }

  @Get('notifications/daily')
  @ApiOperation({ summary: 'สถิติการแจ้งเตือนรายวันแยกตามประเภท' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'จำนวนวันที่ต้องการย้อนหลัง (ค่าเริ่มต้น 7)',
  })
  @ApiOkResponse({ type: NotificationChartResponseDto })
  async getNotificationsPerDay(@Query('days') days?: number) {
    const d = days ?? 7;
    return await this.dashboardService.getNotificationsPerDay(d);
  }

  @Get('notifications/hourly')
  @ApiOperation({ summary: 'สถิติการแจ้งเตือนรายชั่วโมงแยกตามประเภท' })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'จำนวนวันที่ต้องการย้อนหลัง (ค่าเริ่มต้น 30)',
  })
  @ApiOkResponse({ type: NotificationChartResponseDto })
  async getNotificationsPerHour(@Query('days') days?: number) {
    const d = days ?? 30;
    return await this.dashboardService.getNotificationsPerHour(d);
  }

  @Get('notifications/categories')
  @ApiOperation({ summary: 'จำนวนแจ้งเตือนตามหมวดหมู่' })
  @ApiQuery({
    name: 'dept_building_id',
    required: false,
    description: 'กรองตามอาคาร/แผนก',
  })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiOkResponse({ type: NotificationCategoryComparisonResponseDto })
  async getNotificationCategoryComparison(
    @Query('dept_building_id') deptBuildingId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const parsedDeptId = deptBuildingId ? Number(deptBuildingId) : undefined;
    const validDeptId =
      parsedDeptId && !Number.isNaN(parsedDeptId) ? parsedDeptId : undefined;

    return await this.dashboardService.getNotificationCategoryComparison({
      deptBuildingId: validDeptId,
      startDate,
      endDate,
    });
  }

  @Get('notifications/signals')
  @ApiOperation({ summary: 'ปริมาณแจ้งเตือนจำแนกตามชนิดสัญญาณ' })
  @ApiQuery({
    name: 'dept_building_id',
    required: false,
    description: 'กรองตามอาคาร/แผนก',
  })
  @ApiQuery({ name: 'start_date', required: false })
  @ApiQuery({ name: 'end_date', required: false })
  @ApiQuery({
    name: 'granularity',
    required: false,
    description: 'ระดับเวลาที่ต้องการ (hour, day, month, year)',
  })
  @ApiOkResponse({ type: NotificationSignalVolumeResponseDto })
  async getNotificationSignalVolume(
    @Query('dept_building_id') deptBuildingId?: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('granularity') granularity?: string,
  ) {
    const parsedDeptId = deptBuildingId ? Number(deptBuildingId) : undefined;
    const validDeptId =
      parsedDeptId && !Number.isNaN(parsedDeptId) ? parsedDeptId : undefined;

    return await this.dashboardService.getNotificationSignalVolume({
      deptBuildingId: validDeptId,
      startDate,
      endDate,
      granularity:
        granularity === 'hour' ||
        granularity === 'day' ||
        granularity === 'month' ||
        granularity === 'year'
          ? granularity
          : undefined,
    });
  }

  @Get('sensors/usage-trend')
  @ApiOperation({
    summary: 'แนวโน้มการใช้งานเซ็นเซอร์ (ติดตั้ง/ซ่อมบำรุง/ปัญหา)',
  })
  @ApiQuery({
    name: 'months',
    required: false,
    description: 'จำนวนเดือนย้อนหลัง (ค่าเริ่มต้น 12, สูงสุด 24)',
  })
  @ApiQuery({
    name: 'dept_building_id',
    required: false,
    description: 'กรองตามอาคาร/แผนก',
  })
  @ApiOkResponse({ type: SensorUsageTrendResponseDto })
  async getSensorUsageTrend(
    @Query('months') months?: string,
    @Query('dept_building_id') deptBuildingId?: string,
  ) {
    const parsedMonths = months ? Number(months) : undefined;
    const parsedDeptId = deptBuildingId ? Number(deptBuildingId) : undefined;

    const validMonths =
      parsedMonths && !Number.isNaN(parsedMonths) ? parsedMonths : undefined;
    const validDeptId =
      parsedDeptId && !Number.isNaN(parsedDeptId) ? parsedDeptId : undefined;

    return await this.dashboardService.getSensorUsageTrend({
      months: validMonths,
      deptBuildingId: validDeptId,
    });
  }
}
