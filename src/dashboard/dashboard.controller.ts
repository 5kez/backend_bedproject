import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  GenderRowDto,
  AgeGroupRowDto,
  AdmitTrendRowDto,
  StatsDto,
  InOutTrendResponseDto,
  NotificationAlertTrendDto,
  AvgStayTrendDto,
  InOutTrendSeriesDto,
} from './dto/dashboard.dto';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';

@Controller('dashboard')
@ApiTags('Dashboard')
@ApiExtraModels(InOutTrendResponseDto, InOutTrendSeriesDto)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'ข้อมูลภาพรวมของแดชบอร์ดพยาบาล' })
  @ApiQuery({ name: 'username', required: true })
  @ApiQuery({
    name: 'siteWide',
    required: false,
    description: 'กำหนดเป็น true เพื่อรวมข้อมูลทั้งไซต์',
  })
  @ApiOkResponse({ type: StatsDto })
  async getStats(
    @Query('username') username: string,
    @Query('siteWide') siteWide?: string,
  ) {
    return this.dashboardService.getStats(username, siteWide === 'true');
  }

  @Get('charts/gender')
  @ApiOperation({ summary: 'สัดส่วนเพศผู้ป่วยในหน่วยงาน' })
  @ApiQuery({ name: 'username', required: true })
  @ApiQuery({ name: 'siteWide', required: false })
  @ApiOkResponse({ type: GenderRowDto, isArray: true })
  async getGender(
    @Query('username') username: string,
    @Query('siteWide') siteWide?: string,
  ): Promise<GenderRowDto[]> {
    return this.dashboardService.getGenderChart(username, siteWide === 'true');
  }

  @Get('charts/age-groups')
  @ApiOperation({ summary: 'จำนวนผู้ป่วยแยกตามช่วงอายุ' })
  @ApiQuery({ name: 'username', required: true })
  @ApiQuery({ name: 'siteWide', required: false })
  @ApiOkResponse({ type: AgeGroupRowDto, isArray: true })
  async getAgeGroups(
    @Query('username') username: string,
    @Query('siteWide') siteWide?: string,
  ): Promise<
    { department_name?: string; age_band: string; patients: number | string }[]
  > {
    return this.dashboardService.getAgeGroups(username, siteWide === 'true');
  }

  @Get('charts/admit-trend')
  @ApiOperation({ summary: 'แนวโน้มการรับผู้ป่วยเข้าในช่วงเวลาที่กำหนด' })
  @ApiQuery({ name: 'username', required: true })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'จำนวนวันย้อนหลัง (ค่าเริ่มต้น 30)',
  })
  @ApiQuery({ name: 'siteWide', required: false })
  @ApiOkResponse({ type: AdmitTrendRowDto, isArray: true })
  async getAdmitTrend(
    @Query('username') username: string,
    @Query('days') days?: string,
    @Query('siteWide') siteWide?: string,
  ): Promise<AdmitTrendRowDto[]> {
    return this.dashboardService.getAdmitTrend(
      username,
      Number(days) || 30,
      siteWide === 'true',
    );
  }

  @Get('charts/inout-trend')
  @ApiOperation({ summary: 'แนวโน้มการเข้า–ออกผู้ป่วย' })
  @ApiQuery({ name: 'username', required: true })
  @ApiQuery({
    name: 'dept_building_id',
    required: true,
    type: Number,
  })
  @ApiQuery({ name: 'siteWide', required: false })
  @ApiOkResponse({
    schema: { $ref: getSchemaPath(InOutTrendResponseDto) },
  })
  async getInOutTrend(
    @Query('username') username: string,
    @Query('dept_building_id') deptBuildingId: number,
    @Query('siteWide') siteWide?: string,
  ) {
    const rows = await this.dashboardService.getPatientInOutTrend(
      username,
      deptBuildingId,
      siteWide === 'true',
    );

    const labels = rows.map((r) => r.day);
    const series = {
      Admit: rows.map((r) => Number(r.admits)),
      Discharge: rows.map((r) => Number(r.discharges)),
    };

    return { labels, series };
  }

  @Get('charts/alert-trend')
  @ApiOperation({ summary: 'แจ้งเตือนล่วงเวลาของเตียงที่มีการแจ้งเตือนสูงสุด' })
  @ApiQuery({ name: 'username', required: true })
  @ApiQuery({ name: 'siteWide', required: false })
  @ApiOkResponse({ type: NotificationAlertTrendDto, isArray: true })
  async getNotificationAlertTrend(
    @Query('username') username: string,
    @Query('siteWide') siteWide?: string,
  ) {
    return this.dashboardService.getNotificationAlertTrend(
      username,
      siteWide === 'true',
    );
  }

  @Get('charts/avg-stay-trend')
  @ApiOperation({ summary: 'แนวโน้มระยะเวลาพักรักษาเฉลี่ย' })
  @ApiQuery({ name: 'username', required: true })
  @ApiQuery({ name: 'siteWide', required: false })
  @ApiOkResponse({ type: AvgStayTrendDto, isArray: true })
  async getAvgStayTrend(
    @Query('username') username: string,
    @Query('siteWide') siteWide?: string,
  ) {
    return this.dashboardService.getAvgStayTrend(username, siteWide === 'true');
  }
}
