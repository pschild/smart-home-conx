import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateRoomDto {

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsArray()
  readonly sensors: { sensorId: string; position: { x: number; y: number } }[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly width: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  readonly height: number;

  @IsOptional()
  readonly position: { x: number; y: number };

}
