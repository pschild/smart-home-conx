import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePreferenceDto {

  @IsNotEmpty()
  @IsString()
  readonly key: string;

  @IsNotEmpty()
  @IsString()
  readonly label: string;

  @IsNotEmpty()
  readonly value: any;

}
