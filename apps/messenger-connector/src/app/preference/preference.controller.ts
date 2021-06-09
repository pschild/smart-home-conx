import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { PreferenceService } from './preference.service';

@Controller('preference')
export class PreferenceController {

  constructor(private readonly preferenceService: PreferenceService) {}

  @Get()
  findAll() {
    return this.preferenceService.findAll();
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body() updatePreferenceDto: UpdatePreferenceDto) {
    return this.preferenceService.update(key, updatePreferenceDto);
  }
}
