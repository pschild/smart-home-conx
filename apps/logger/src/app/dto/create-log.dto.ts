import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLogDto {

  @IsNotEmpty()
  @IsString()
  readonly source: string;

  @IsNotEmpty()
  @IsString()
  readonly message: string;

}
