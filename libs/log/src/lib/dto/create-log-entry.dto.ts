import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLogEntryDto {

  @IsNotEmpty()
  @IsString()
  readonly origin: string;

  @IsNotEmpty()
  @IsString()
  readonly message: string;

}