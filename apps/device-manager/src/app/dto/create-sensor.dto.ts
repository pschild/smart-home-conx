import { SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSensorDto {

  @IsNotEmpty()
  @IsEnum(SensorType)
  readonly type: SensorType;

  // @IsNotEmpty()
  @IsString()
  readonly deviceId: string;

  @IsOptional()
  readonly position: { x: number; y: number };

  @IsString()
  readonly roomId: string;

}
