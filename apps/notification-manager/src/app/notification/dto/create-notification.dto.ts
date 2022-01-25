import { Priority } from '@smart-home-conx/api/shared/data-access/models';
import { IsDate, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {

  @IsNotEmpty()
  @IsString()
  readonly context: string;

  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly message: string;

  @IsEnum(Priority)
  readonly priority: Priority;

  @IsOptional()
  @IsDate()
  readonly autoRemoveAfter?: Date;

}
