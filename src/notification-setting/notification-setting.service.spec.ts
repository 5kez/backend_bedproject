import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationSettingService } from './notification-setting.service';
import { NotificationSetting } from './entities/notification-setting.entity';
import { SensorType } from '../sensor-type/entities/sensor-type.entity';

describe('NotificationSettingService', () => {
  let service: NotificationSettingService;

  const mockNotificationSettingRepository = {
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockSensorTypeRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationSettingService,
        {
          provide: getRepositoryToken(NotificationSetting),
          useValue: mockNotificationSettingRepository,
        },
        {
          provide: getRepositoryToken(SensorType),
          useValue: mockSensorTypeRepository,
        },
      ],
    }).compile();

    service = module.get<NotificationSettingService>(
      NotificationSettingService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDefaultNotificationSettings', () => {
    it('should create default notification settings for all sensor types', async () => {
      const mockSensorTypes = [
        { id: 1, name: 'BedSensor', desc: 'Bed sensor' },
        { id: 2, name: 'HeartRate', desc: 'Heart rate sensor' },
        { id: 3, name: 'Spo2', desc: 'SpO2 sensor' },
        { id: 4, name: 'Temperature', desc: 'Temperature sensor' },
      ];

      mockSensorTypeRepository.find.mockResolvedValue(mockSensorTypes);
      mockNotificationSettingRepository.save.mockResolvedValue({});

      await service.createDefaultNotificationSettings(1);

      expect(mockSensorTypeRepository.find).toHaveBeenCalled();
      expect(mockNotificationSettingRepository.save).toHaveBeenCalledWith([
        {
          patient_id: 1,
          sensor_type_id: 1,
          enabled: true,
          config: {
            alert_positions: [3, 4, 5],
          },
        },
        {
          patient_id: 1,
          sensor_type_id: 2,
          enabled: true,
          config: {
            threshold_low: 60,
            threshold_high: 100,
          },
        },
        {
          patient_id: 1,
          sensor_type_id: 3,
          enabled: true,
          config: {
            threshold_low: 90,
          },
        },
        {
          patient_id: 1,
          sensor_type_id: 4,
          enabled: true,
          config: {
            threshold: { min: 0, max: 100 },
          },
        },
      ]);
    });
  });

  describe('findByPatientId', () => {
    it('should return notification settings for a patient', async () => {
      const mockSettings = [
        {
          id: 1,
          patient_id: 1,
          sensor_type_id: 1,
          enabled: true,
          config: {},
        },
      ];

      mockNotificationSettingRepository.find.mockResolvedValue(mockSettings);

      const result = await service.findByPatientId(1);

      expect(mockNotificationSettingRepository.find).toHaveBeenCalledWith({
        where: { patient_id: 1 },
        relations: ['patient', 'sensorType'],
      });
      expect(result).toEqual(mockSettings);
    });
  });

  describe('removeByPatientId', () => {
    it('should remove all notification settings for a patient', async () => {
      mockNotificationSettingRepository.delete.mockResolvedValue({});

      await service.removeByPatientId(1);

      expect(mockNotificationSettingRepository.delete).toHaveBeenCalledWith({
        patient_id: 1,
      });
    });
  });
});
