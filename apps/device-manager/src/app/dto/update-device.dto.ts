import { PartialType } from '@nestjs/mapped-types';
import { ConnectionStatus } from '@smart-home-conx/api/shared/data-access/models';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { CreateDeviceDto } from './create-device.dto';

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {

  @IsOptional()
  @IsEnum(ConnectionStatus)
  readonly connectionStatus?: ConnectionStatus;

  @IsOptional()
  @IsDate()
  readonly connectionStatusChangedAt?: Date;

  @IsOptional()
  @IsDate()
  readonly lastPing?: Date;

}
