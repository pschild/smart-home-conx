import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeviceDto {

  @IsNotEmpty()
  @IsString()
  readonly model: string;

  @IsOptional()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  readonly pioEnv: string;

  @IsOptional()
  @IsString()
  readonly firmware: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  readonly chipId: number;

  @IsOptional()
  @IsString()
  readonly place: string;

  @IsBoolean()
  readonly batteryPowered: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly expectedPingInterval: number;

}
