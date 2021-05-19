import { PartialType } from '@nestjs/mapped-types';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { ConnectionStatus } from '../enum/connection-status.enum';
import { CreateDeviceDto } from './create-device.dto';

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {

  @IsOptional()
  @IsEnum(ConnectionStatus)
  readonly connectionStatus: ConnectionStatus;

  @IsOptional()
  @IsDate()
  readonly connectionStatusChangedAt: Date;

}
