import { PartialType } from '@nestjs/mapped-types';
import { CreateEspDto } from './create-esp.dto';

export class UpdateEspDto extends PartialType(CreateEspDto) {}
