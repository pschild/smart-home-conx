import { SensorDetailModel, SensorType } from '@smart-home-conx/api/shared/data-access/models';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateSensorDto {

  @IsNotEmpty()
  @IsEnum(SensorType)
  readonly type: SensorType;

  // @IsNotEmpty()
  @IsNumber()
  readonly chipId: number;

  @IsOptional()
  readonly position: { x: number; y: number };

  @IsString()
  @IsOptional()
  readonly roomId: string;

  @IsNumber()
  @IsOptional()
  readonly pin: number;

  @IsOptional()
  readonly details: SensorDetailModel;

}
