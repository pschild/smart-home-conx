import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateEspDto {

  @IsNotEmpty()
  @IsString()
  readonly model: string;

  @IsOptional()
  readonly description: string;

  @IsNotEmpty()
  @IsString()
  readonly pioEnv: string;

  @IsNotEmpty()
  @IsNumber()
  readonly chipId: number;
}
