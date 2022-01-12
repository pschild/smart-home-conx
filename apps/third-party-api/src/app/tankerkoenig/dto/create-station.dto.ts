import { IsDate, IsNumber, IsString } from 'class-validator';

export class CreateStationDto {

  @IsDate()
  updatedAt: Date;

  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  brand: string;

  @IsString()
  street: string;

  @IsString()
  houseNumber: string;

  @IsNumber()
  postCode: number;

  @IsString()
  place: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

}
