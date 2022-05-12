import { SensorDetailModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';

export interface SensorForm {
  type: SensorType;
  name: string;
  chipId: number;
  pin: number;
  createdAt: Date;
  details: SensorDetailModel;
}
