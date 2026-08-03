import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/users.module';
import { PatientModule } from './patient/patient.module';
// import { NotiTemplateModule } from './noti-template/noti-template.module';
import { SitesTypeModule } from './sites-types/sites-type.module';
import { SiteModule } from './sites/site.module';
import { BuildingModule } from './buildings/building.module';
import { FloorsModule } from './floors/floors.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { UsersController } from './user/users.controller';
import { UsersService } from './user/users.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataSource } from 'typeorm/data-source/DataSource';
//import { User } from './user/entities/user.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { SensorsModule } from './sensor/sensor.module';
import { SensorsTypeModule } from './sensor-type/sensor-type.module';
import { ProvinceModule } from './province/province.module';
import { ProfileModule } from './profile/profile.module';
import { SensorStatusModule } from './sensor-status/sensor-status.module';
import { SensorProfileModule } from './sensor-profile/sensor-profile.module';
import { SensorTemplatesModule } from './sensor-template/sensor-template.module';
import { LlmModule } from './llm/llm.module';
import { MqttModule } from './mqtt/mqtt.module';
import { HistoryNotificationModule } from './history_notification/history_notification.module';
import { NotificationSettingModule } from './notification-setting/notification-setting.module';
import { NotificationModule } from './notification/notification.module';
import { DepartmentModule } from './department/department.module';
import { DepartmentBuildingModule } from './department_building/department-building.module';
import { BedModule } from './bed/bed.module';
import { PatientHistoryModule } from './patient-history/patient-history.module';
import { LlmService } from './llm/llm.service';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdminDashboardModule } from './dashboard/dashboardAdmin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || '8bits',
      autoLoadEntities: true,
      synchronize: false,
      // แก้ไขปัญหาการหลุดการเชื่อมต่อ MySQL
      extra: {
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true,
        idleTimeout: 300000,
        maxReconnect: 3,
        reconnectTimeout: 2000,
      },
      retryAttempts: 3,
      retryDelay: 3000,
    }),
    AuthModule,
    UsersModule,
    PatientModule,
    // NotiTemplateModule,
    PatientHistoryModule,
    LlmModule,
    SensorStatusModule,
    SensorsModule,
    SensorTemplatesModule,
    SensorProfileModule,
    SensorsTypeModule,
    SiteModule,
    SitesTypeModule,
    BuildingModule,
    FloorsModule,
    ProvinceModule,
    RolesModule,
    ProfileModule,
    MqttModule,
    HistoryNotificationModule,
    NotificationSettingModule,
    NotificationModule,
    DepartmentModule,
    DepartmentBuildingModule,
    DashboardModule,
    AdminDashboardModule,
    BedModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads/',
    }),
  ],
  controllers: [AuthController, UsersController, AppController],
  providers: [AuthService, UsersService, AppService, LlmService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
