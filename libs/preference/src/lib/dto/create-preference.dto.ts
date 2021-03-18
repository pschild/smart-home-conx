import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePreferenceDto {

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  readonly value: string;
}
