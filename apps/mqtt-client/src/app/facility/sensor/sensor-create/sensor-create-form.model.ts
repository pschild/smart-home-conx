import { SensorDetailModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';

export interface SensorForm {
  type: SensorType;
  chipId: number;
  pin: number;
  createdAt: Date;
  details: SensorDetailModel;
}
