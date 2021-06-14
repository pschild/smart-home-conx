import { OmitType } from '@nestjs/mapped-types';
import { CreatePreferenceDto } from './create-preference.dto';

export class UpdatePreferenceDto extends OmitType(CreatePreferenceDto, ['key', 'label'] as const) {}
