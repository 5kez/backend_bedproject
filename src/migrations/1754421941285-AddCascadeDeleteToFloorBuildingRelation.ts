import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeDeleteToFloorBuildingRelation1754421941285
  implements MigrationInterface
{
  name = 'AddCascadeDeleteToFloorBuildingRelation1754421941285';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`floor\` DROP FOREIGN KEY \`fk_floor_building\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` DROP FOREIGN KEY \`FK_patient_floor\``,
    );
    await queryRunner.query(`DROP INDEX \`fk Floor\` ON \`patient\``);
    await queryRunner.query(
      `CREATE TABLE \`notification\` (\`id\` int NOT NULL AUTO_INCREMENT, \`patient_id\` int NOT NULL, \`patient_name\` varchar(255) NOT NULL, \`sensor_type_id\` int NOT NULL, \`sensor_type_name\` varchar(255) NOT NULL, \`message\` text NOT NULL, \`details\` text NULL, \`status\` enum ('unread', 'read', 'dismissed') NOT NULL DEFAULT 'unread', \`user_id\` int NULL, \`metadata\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`notification_template\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`heartRateMin\` int NULL, \`heartRateMax\` int NULL, \`oxygenMin\` int NULL, \`oxygenMax\` int NULL, \`condition\` enum ('1', '2', '3', '4', '5') NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`updated_at\``);
    await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`created_at\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` DROP COLUMN \`sensor_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` CHANGE \`site_type_id\` \`site_type_id\` tinyint NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`sites_type\` DROP PRIMARY KEY`);
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` DROP COLUMN \`site_type_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` ADD \`site_type_id\` int NOT NULL PRIMARY KEY AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` CHANGE \`name\` \`name\` varchar(60) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_type\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_type\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_template\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_template\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` CHANGE \`floor_id\` \`floor_id\` tinyint NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`floor\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`floor\` DROP COLUMN \`floor_id\``);
    await queryRunner.query(
      `ALTER TABLE \`floor\` ADD \`floor_id\` int NOT NULL PRIMARY KEY AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` CHANGE \`floor_name\` \`floor_name\` varchar(60) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` CHANGE \`floor_name_th\` \`floor_name_th\` varchar(60) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`building\` CHANGE \`sites_id\` \`sites_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`building\` CHANGE \`global_id\` \`global_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`building\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`building\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`sites_name\` \`sites_name\` varchar(60) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`lat\` \`lat\` float(10,6) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`lng\` \`lng\` float(10,6) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`address\` \`address\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`sites_type_id\` \`sites_type_id\` tinyint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`prov_id\` \`prov_id\` tinyint NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`site_global\` \`site_global\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`birthDate\` \`birthDate\` datetime NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`status\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`status\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`telFam\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`telFam\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`image\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`image\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`sex\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`sex\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`remark\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`remark\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`room_id\` \`room_id\` int NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`floor_id\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`floor_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`bed_id\` \`bed_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`admitDate\` \`admitDate\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`master_status\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`master_status\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`role_id\` \`role_id\` tinyint NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP PRIMARY KEY`);
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`role_id\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`role_id\` int NOT NULL PRIMARY KEY AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`roles_name\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`roles_name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`description\` \`description\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`created_at\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`created_at\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`updated_at\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`updated_at\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`roles_code\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`roles_code\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`province_id\` \`province_id\` tinyint UNSIGNED NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`prov_name\` \`prov_name\` varchar(60) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`prov_name_th\` \`prov_name_th\` varchar(60) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`created_at\` \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`geo_id\` \`geo_id\` tinyint(1) NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`profile\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`profile\` ADD \`name\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`profile\` DROP COLUMN \`surname\``);
    await queryRunner.query(
      `ALTER TABLE \`profile\` ADD \`surname\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`profile\` DROP COLUMN \`email\``);
    await queryRunner.query(
      `ALTER TABLE \`profile\` ADD \`email\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`profile\` DROP COLUMN \`line_id\``);
    await queryRunner.query(
      `ALTER TABLE \`profile\` ADD \`line_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`profile\` DROP COLUMN \`photo\``);
    await queryRunner.query(
      `ALTER TABLE \`profile\` ADD \`photo\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`profile\` CHANGE \`sites_id\` \`sites_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`profile\` CHANGE \`created_at\` \`created_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`profile\` CHANGE \`updated_at\` \`updated_at\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_setting\` CHANGE \`enabled\` \`enabled\` tinyint(1) NOT NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_setting\` CHANGE \`updated_at\` \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Patient_Id\` \`Patient_Id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Noti_time\` \`Noti_time\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Noti_type\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Noti_type\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Noti_desc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Noti_desc\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Noti_id\` \`Noti_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Noti_setting_id\` \`Noti_setting_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Status\` \`Status\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Sensor_id\` \`Sensor_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Sensor_type\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Sensor_type\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Device_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Device_id\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`User_id\` \`User_id\` int NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Patient_indate\` \`Patient_indate\` datetime NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Patient_remark\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Patient_remark\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Patient_department\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Patient_department\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Patient_room_num\` \`Patient_room_num\` int NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_e9463578c94155527b7cb1964c\` ON \`notification_setting\` (\`sensor_type_id\`)`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX \`IDX_1a131b1fbfc919f8172efa8da7\` ON \`notification_setting\` (\`patient_id\`, \`sensor_type_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` ADD CONSTRAINT \`FK_1565850c51d1cc30e896101fa77\` FOREIGN KEY (\`building_id\`) REFERENCES \`building\`(\`building_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`building\` ADD CONSTRAINT \`FK_9fcbd5c99c3daa82000ff5dd660\` FOREIGN KEY (\`sites_id\`) REFERENCES \`sites\`(\`site_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor\` ADD CONSTRAINT \`FK_93fb06a8ef123f62330f3364476\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patient\`(\`patient_id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_profile\` ADD CONSTRAINT \`FK_2cf8fb9d4c5adff7d1f55af2340\` FOREIGN KEY (\`sensorId\`) REFERENCES \`sensor\`(\`sensor_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_a2841150a10c603721f15b52708\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patient\`(\`patient_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` ADD CONSTRAINT \`FK_c62aa2966a132d36854ea86d11b\` FOREIGN KEY (\`sensor_type_id\`) REFERENCES \`sensor_type\`(\`sensor_type_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_setting\` ADD CONSTRAINT \`FK_2a6256cb1f8c88ff97461bd4407\` FOREIGN KEY (\`patient_id\`) REFERENCES \`patient\`(\`patient_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_setting\` ADD CONSTRAINT \`FK_e9463578c94155527b7cb1964c7\` FOREIGN KEY (\`sensor_type_id\`) REFERENCES \`sensor_type\`(\`sensor_type_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification_setting\` DROP FOREIGN KEY \`FK_e9463578c94155527b7cb1964c7\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_setting\` DROP FOREIGN KEY \`FK_2a6256cb1f8c88ff97461bd4407\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_c62aa2966a132d36854ea86d11b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification\` DROP FOREIGN KEY \`FK_a2841150a10c603721f15b52708\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_profile\` DROP FOREIGN KEY \`FK_2cf8fb9d4c5adff7d1f55af2340\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor\` DROP FOREIGN KEY \`FK_93fb06a8ef123f62330f3364476\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`building\` DROP FOREIGN KEY \`FK_9fcbd5c99c3daa82000ff5dd660\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` DROP FOREIGN KEY \`FK_1565850c51d1cc30e896101fa77\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_1a131b1fbfc919f8172efa8da7\` ON \`notification_setting\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_e9463578c94155527b7cb1964c\` ON \`notification_setting\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Patient_room_num\` \`Patient_room_num\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Patient_department\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Patient_department\` varchar(100) COLLATE "utf8mb4_general_ci" NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Patient_remark\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Patient_remark\` text COLLATE "utf8mb4_general_ci" NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Patient_indate\` \`Patient_indate\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`User_id\` \`User_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Device_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Device_id\` varchar(50) COLLATE "utf8mb4_general_ci" NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Sensor_type\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Sensor_type\` varchar(100) COLLATE "utf8mb4_general_ci" NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Sensor_id\` \`Sensor_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Status\` \`Status\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Noti_setting_id\` \`Noti_setting_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Noti_id\` \`Noti_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Noti_desc\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Noti_desc\` text COLLATE "utf8mb4_general_ci" NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` DROP COLUMN \`Noti_type\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` ADD \`Noti_type\` text COLLATE "utf8mb4_general_ci" NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Noti_time\` \`Noti_time\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`history_notification\` CHANGE \`Patient_Id\` \`Patient_Id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_setting\` CHANGE \`updated_at\` \`updated_at\` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`notification_setting\` CHANGE \`enabled\` \`enabled\` tinyint(1) NULL DEFAULT '1'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`profile\` CHANGE \`updated_at\` \`updated_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`profile\` CHANGE \`created_at\` \`created_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`profile\` CHANGE \`sites_id\` \`sites_id\` int NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`profile\` DROP COLUMN \`photo\``);
    await queryRunner.query(
      `ALTER TABLE \`profile\` ADD \`photo\` tinytext COLLATE "utf8mb4_general_ci" NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`profile\` DROP COLUMN \`line_id\``);
    await queryRunner.query(
      `ALTER TABLE \`profile\` ADD \`line_id\` varchar(60) COLLATE "utf8mb4_general_ci" NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`profile\` DROP COLUMN \`email\``);
    await queryRunner.query(
      `ALTER TABLE \`profile\` ADD \`email\` varchar(60) COLLATE "utf8mb4_general_ci" NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`profile\` DROP COLUMN \`surname\``);
    await queryRunner.query(
      `ALTER TABLE \`profile\` ADD \`surname\` varchar(60) COLLATE "utf8mb4_general_ci" NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`profile\` DROP COLUMN \`name\``);
    await queryRunner.query(
      `ALTER TABLE \`profile\` ADD \`name\` varchar(60) COLLATE "utf8mb4_general_ci" NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`geo_id\` \`geo_id\` tinyint(1) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`updated_at\` \`updated_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`created_at\` \`created_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`prov_name_th\` \`prov_name_th\` varchar(60) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`prov_name\` \`prov_name\` varchar(60) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`province\` CHANGE \`province_id\` \`province_id\` tinyint NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`roles_code\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`roles_code\` varchar(20) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`updated_at\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`updated_at\` datetime NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`created_at\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`created_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`description\` \`description\` varchar(255) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`roles_name\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`roles_name\` varchar(60) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`roles\` DROP COLUMN \`role_id\``);
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD \`role_id\` tinyint NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` ADD PRIMARY KEY (\`role_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`roles\` CHANGE \`role_id\` \`role_id\` tinyint NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`master_status\` CHANGE \`updated_at\` \`updated_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`master_status\` CHANGE \`created_at\` \`created_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`admitDate\` \`admitDate\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`bed_id\` \`bed_id\` int NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`floor_id\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`floor_id\` tinyint NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`room_id\` \`room_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`updated_at\` \`updated_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`created_at\` \`created_at\` datetime NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`remark\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`remark\` text CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`sex\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`sex\` char(1) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`image\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`image\` varchar(60) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`telFam\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`telFam\` varchar(60) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`patient\` DROP COLUMN \`status\``);
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`status\` varchar(1) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` CHANGE \`birthDate\` \`birthDate\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`site_global\` \`site_global\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`updated_at\` \`updated_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`created_at\` \`created_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`prov_id\` \`prov_id\` tinyint NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`sites_type_id\` \`sites_type_id\` tinyint NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`address\` \`address\` varchar(255) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`lng\` \`lng\` float(10,6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`lat\` \`lat\` float(10,6) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites\` CHANGE \`sites_name\` \`sites_name\` varchar(60) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`building\` CHANGE \`updated_at\` \`updated_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`building\` CHANGE \`created_at\` \`created_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`building\` CHANGE \`global_id\` \`global_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`building\` CHANGE \`sites_id\` \`sites_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` CHANGE \`updated_at\` \`updated_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` CHANGE \`created_at\` \`created_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` CHANGE \`floor_name_th\` \`floor_name_th\` varchar(60) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` CHANGE \`floor_name\` \`floor_name\` varchar(60) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`floor\` DROP COLUMN \`floor_id\``);
    await queryRunner.query(
      `ALTER TABLE \`floor\` ADD \`floor_id\` tinyint NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` ADD PRIMARY KEY (\`floor_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` CHANGE \`floor_id\` \`floor_id\` tinyint NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_template\` CHANGE \`updated_at\` \`updated_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_template\` CHANGE \`created_at\` \`created_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_type\` CHANGE \`updated_at\` \`updated_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sensor_type\` CHANGE \`created_at\` \`created_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` CHANGE \`updated_at\` \`updated_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` CHANGE \`created_at\` \`created_at\` datetime(0) NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` CHANGE \`name\` \`name\` varchar(60) CHARACTER SET "utf8mb3" COLLATE "utf8mb3_general_ci" NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` DROP COLUMN \`site_type_id\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` ADD \`site_type_id\` tinyint NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` ADD PRIMARY KEY (\`site_type_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`sites_type\` CHANGE \`site_type_id\` \`site_type_id\` tinyint NOT NULL AUTO_INCREMENT`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD \`sensor_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`created_at\` datetime NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`updated_at\` datetime NULL`,
    );
    await queryRunner.query(`DROP TABLE \`notification_template\``);
    await queryRunner.query(`DROP TABLE \`notification\``);
    await queryRunner.query(
      `CREATE INDEX \`fk Floor\` ON \`patient\` (\`floor_id\`)`,
    );
    await queryRunner.query(
      `ALTER TABLE \`patient\` ADD CONSTRAINT \`FK_patient_floor\` FOREIGN KEY (\`floor_id\`) REFERENCES \`floor\`(\`floor_id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`floor\` ADD CONSTRAINT \`fk_floor_building\` FOREIGN KEY (\`building_id\`) REFERENCES \`building\`(\`building_id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
