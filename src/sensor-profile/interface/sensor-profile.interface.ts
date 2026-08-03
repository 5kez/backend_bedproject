export interface SensorPose {
  name: string;
  name_img: string;
  active: boolean;
  delay: number;
  repeat: number;
  sensitivity: number;
}

export interface SensorProfileConfig {
  poses: SensorPose[];
  globalSensitivity: number;
}
export type SensorPoseConfig = SensorProfileConfig | Record<string, any>;

export interface HeartRateConfig {
  threshold: number;
  alertEnabled: boolean;
}
export type SensorConfig =
  | SensorProfileConfig
  | HeartRateConfig
  | Record<string, any>;
