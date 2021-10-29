import { FloorType } from '@smart-home-conx/api/shared/data-access/models';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly width: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly height: number;

  @IsEnum(FloorType)
  floor: FloorType;

  @IsOptional()
  readonly position: { x: number; y: number };

}
