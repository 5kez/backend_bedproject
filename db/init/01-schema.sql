-- Clean schema generated from the TypeORM entities by db/dump-schema.sh
-- (synchronize against an empty MySQL 8 database, then mysqldump --no-data).
-- Runs automatically on the first 'docker compose up' via docker-entrypoint-initdb.d.
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
CREATE TABLE `bed` (
  `bed_id` int NOT NULL AUTO_INCREMENT,
  `department_building_id` int NOT NULL,
  `patient_id` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`bed_id`),
  UNIQUE KEY `REL_37746f033360392a3e5d184304` (`patient_id`),
  KEY `FK_d835eaf9d81456e4f5405c7f64a` (`department_building_id`),
  CONSTRAINT `FK_37746f033360392a3e5d1843041` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `FK_d835eaf9d81456e4f5405c7f64a` FOREIGN KEY (`department_building_id`) REFERENCES `department_building` (`department_building_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `bed_assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `bed_id` int NOT NULL,
  `status` enum('active','transferred','discharged') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `assigned_at` datetime NOT NULL,
  `transferred_at` datetime DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `assigned_by` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`assignment_id`),
  KEY `FK_51fe4bc8e133a25d739fdd153ca` (`patient_id`),
  KEY `FK_4d247e763c423a7438b789f9edb` (`bed_id`),
  KEY `FK_04c6d5f5974e6f8298e4b8be955` (`assigned_by`),
  CONSTRAINT `FK_04c6d5f5974e6f8298e4b8be955` FOREIGN KEY (`assigned_by`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_4d247e763c423a7438b789f9edb` FOREIGN KEY (`bed_id`) REFERENCES `bed` (`bed_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_51fe4bc8e133a25d739fdd153ca` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `bed_sensors` (
  `bed_sensor_id` int NOT NULL AUTO_INCREMENT,
  `bed_id` int NOT NULL,
  `sensor_id` int NOT NULL,
  `sensor_type_id` int NOT NULL,
  `installation_date` datetime NOT NULL,
  `last_maintenance` datetime DEFAULT NULL,
  `calibration_data` json DEFAULT NULL,
  `status` enum('active','inactive','maintenance','error') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `installed_by` int NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`bed_sensor_id`),
  KEY `FK_a7c8c4f6d8e173171a7399e451f` (`bed_id`),
  KEY `FK_dd26d5c57164e52bf40542ddde9` (`sensor_id`),
  KEY `FK_05043cd36c739e923a4c2372aa6` (`sensor_type_id`),
  KEY `FK_0309ee739e84771d012666ae987` (`installed_by`),
  CONSTRAINT `FK_0309ee739e84771d012666ae987` FOREIGN KEY (`installed_by`) REFERENCES `user` (`user_id`) ON DELETE RESTRICT,
  CONSTRAINT `FK_05043cd36c739e923a4c2372aa6` FOREIGN KEY (`sensor_type_id`) REFERENCES `sensor_type` (`sensor_type_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_a7c8c4f6d8e173171a7399e451f` FOREIGN KEY (`bed_id`) REFERENCES `bed` (`bed_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_dd26d5c57164e52bf40542ddde9` FOREIGN KEY (`sensor_id`) REFERENCES `sensor` (`sensor_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `building` (
  `building_id` int NOT NULL AUTO_INCREMENT,
  `build_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` float(10,6) DEFAULT NULL,
  `lng` float(10,6) DEFAULT NULL,
  `site_id` int NOT NULL,
  `global_id` int NOT NULL,
  `floor_count` int DEFAULT '1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`building_id`),
  KEY `FK_f912f7e8b57b7999e8d4ae0588f` (`site_id`),
  CONSTRAINT `FK_f912f7e8b57b7999e8d4ae0588f` FOREIGN KEY (`site_id`) REFERENCES `sites` (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `department_building` (
  `department_building_id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `building_id` int NOT NULL,
  `floor_id` int DEFAULT NULL,
  `floor_number` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`department_building_id`),
  KEY `FK_afb0ca7d872b3b7aa5826f9bbc6` (`department_id`),
  KEY `FK_50331e00f6440754e2373997833` (`building_id`),
  KEY `FK_9dceae621191c22ddf76325759c` (`floor_id`),
  CONSTRAINT `FK_50331e00f6440754e2373997833` FOREIGN KEY (`building_id`) REFERENCES `building` (`building_id`),
  CONSTRAINT `FK_9dceae621191c22ddf76325759c` FOREIGN KEY (`floor_id`) REFERENCES `floor` (`floor_id`),
  CONSTRAINT `FK_afb0ca7d872b3b7aa5826f9bbc6` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `departments` (
  `department_id` int NOT NULL AUTO_INCREMENT,
  `department_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `floor` (
  `floor_id` int NOT NULL AUTO_INCREMENT,
  `floor_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `floor_name_en` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `building_id` int DEFAULT NULL,
  PRIMARY KEY (`floor_id`),
  KEY `FK_1565850c51d1cc30e896101fa77` (`building_id`),
  CONSTRAINT `FK_1565850c51d1cc30e896101fa77` FOREIGN KEY (`building_id`) REFERENCES `building` (`building_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `history_notification` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Patient_Id` int NOT NULL,
  `Noti_time` datetime NOT NULL,
  `Noti_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Noti_desc` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Noti_id` int NOT NULL,
  `Noti_setting_id` int NOT NULL,
  `Status` int NOT NULL,
  `Sensor_id` int NOT NULL,
  `Sensor_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Device_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `User_id` int NOT NULL,
  `Patient_indate` datetime DEFAULT NULL,
  `Patient_remark` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Patient_department` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `Patient_room_num` int NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_ae8ceef17b2f5669fa3c613ba64` (`Patient_Id`),
  CONSTRAINT `FK_ae8ceef17b2f5669fa3c613ba64` FOREIGN KEY (`Patient_Id`) REFERENCES `patient` (`patient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `history_patient` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `sensors_id` int DEFAULT NULL,
  `in_date` timestamp NOT NULL,
  `out_date` timestamp NULL DEFAULT NULL,
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `create_user_id` int NOT NULL,
  `update_user_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`history_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `master_status` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_img` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status_group` int NOT NULL,
  `active` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `create_userlogin` int NOT NULL,
  `update_userlogin` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `notification_history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `alert_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `alert_level` enum('info','warning','critical','emergency') COLLATE utf8mb4_unicode_ci NOT NULL,
  `patient_id` int NOT NULL,
  `bed_id` int DEFAULT NULL,
  `sensor_id` int DEFAULT NULL,
  `alert_message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sensor_data` json DEFAULT NULL,
  `status` enum('active','resolved','acknowledged') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `resolved_at` datetime DEFAULT NULL,
  `resolved_by` int DEFAULT NULL,
  `resolution_notes` text COLLATE utf8mb4_unicode_ci,
  `acknowledged_at` datetime DEFAULT NULL,
  `acknowledged_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`history_id`),
  KEY `FK_cee6f487b581b0f42b78a34cd52` (`patient_id`),
  KEY `FK_058696bcfe2b828349765424db3` (`bed_id`),
  KEY `FK_0867f5130e9eb327f701524926d` (`sensor_id`),
  KEY `FK_68bfb60ea3efbb389eb7ff1e566` (`resolved_by`),
  KEY `FK_dcd9c7bc0b88d3e74e083e70f59` (`acknowledged_by`),
  CONSTRAINT `FK_058696bcfe2b828349765424db3` FOREIGN KEY (`bed_id`) REFERENCES `bed` (`bed_id`) ON DELETE SET NULL,
  CONSTRAINT `FK_0867f5130e9eb327f701524926d` FOREIGN KEY (`sensor_id`) REFERENCES `sensor` (`sensor_id`) ON DELETE SET NULL,
  CONSTRAINT `FK_68bfb60ea3efbb389eb7ff1e566` FOREIGN KEY (`resolved_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `FK_cee6f487b581b0f42b78a34cd52` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`) ON DELETE CASCADE,
  CONSTRAINT `FK_dcd9c7bc0b88d3e74e083e70f59` FOREIGN KEY (`acknowledged_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `notification_setting` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `sensor_type_id` int NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  `config` json NOT NULL,
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_1a131b1fbfc919f8172efa8da7` (`patient_id`,`sensor_type_id`),
  KEY `IDX_e9463578c94155527b7cb1964c` (`sensor_type_id`),
  CONSTRAINT `FK_2a6256cb1f8c88ff97461bd4407` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`patient_id`),
  CONSTRAINT `FK_e9463578c94155527b7cb1964c7` FOREIGN KEY (`sensor_type_id`) REFERENCES `sensor_type` (`sensor_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `patient` (
  `patient_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `birthDate` datetime NOT NULL,
  `status` int NOT NULL,
  `telFam` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thaiId` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sex` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `create_user_id` int NOT NULL,
  `update_user_id` int NOT NULL,
  `room_id` int NOT NULL,
  `floor_id` int NOT NULL,
  `admitDate` datetime NOT NULL,
  `bed_id` int DEFAULT NULL,
  `site_id` int NOT NULL,
  `department_id` int NOT NULL,
  PRIMARY KEY (`patient_id`),
  KEY `FK_600a124e17604c837784fa6325b` (`department_id`),
  CONSTRAINT `FK_600a124e17604c837784fa6325b` FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `profile` (
  `profile_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `surname` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `site_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `province` (
  `province_id` tinyint unsigned NOT NULL AUTO_INCREMENT,
  `prov_code` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prov_name` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prov_name_th` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `geo_id` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`province_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `roles_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `roles_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `sensor` (
  `sensor_id` int NOT NULL AUTO_INCREMENT,
  `bed_id` int DEFAULT NULL,
  `mac` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `site_Id` int NOT NULL,
  `sensor_type_id` int NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`sensor_id`),
  KEY `FK_0dc13de16cbde6deabae21c92e4` (`bed_id`),
  KEY `FK_61270f2b0e52f614a00b00129e6` (`sensor_type_id`),
  CONSTRAINT `FK_0dc13de16cbde6deabae21c92e4` FOREIGN KEY (`bed_id`) REFERENCES `bed` (`bed_id`) ON DELETE SET NULL,
  CONSTRAINT `FK_61270f2b0e52f614a00b00129e6` FOREIGN KEY (`sensor_type_id`) REFERENCES `sensor_type` (`sensor_type_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `sensor_profile` (
  `sensor_profile_id` int NOT NULL AUTO_INCREMENT,
  `sensorType_Id` int NOT NULL,
  `config` json NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `sensorId` int DEFAULT NULL,
  PRIMARY KEY (`sensor_profile_id`),
  UNIQUE KEY `REL_2cf8fb9d4c5adff7d1f55af234` (`sensorId`),
  CONSTRAINT `FK_2cf8fb9d4c5adff7d1f55af2340` FOREIGN KEY (`sensorId`) REFERENCES `sensor` (`sensor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `sensor_template` (
  `sensor_template_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sensorType_Id` int NOT NULL,
  `config` json NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`sensor_template_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `sensor_type` (
  `sensor_type_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `desc` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`sensor_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `sites` (
  `site_id` int NOT NULL AUTO_INCREMENT,
  `sites_name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lat` float(10,6) NOT NULL,
  `lng` float(10,6) NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sites_type_id` tinyint NOT NULL,
  `prov_id` tinyint NOT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `site_global` int NOT NULL DEFAULT '1',
  `name_img` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`site_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `sites_type` (
  `site_type_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remark` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`site_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE `user` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `profile_id` int NOT NULL,
  `site_id` int NOT NULL,
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `build_id` int NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` int NOT NULL,
  `roles_code` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` int NOT NULL,
  `floor_id` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SET FOREIGN_KEY_CHECKS = 1;
