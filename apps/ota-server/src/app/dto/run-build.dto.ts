import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class RunBuildDto {

  @IsNotEmpty()
  @IsString()
  readonly libName: string;

  @IsNotEmpty()
  @IsString()
  readonly releaseType: string;

  @IsNotEmpty()
  @IsNumber({}, { each: true })
  readonly chipIds: number[];
}
