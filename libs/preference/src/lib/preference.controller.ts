import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { PreferenceService } from './preference.service';

@Controller('preference')
export class PreferenceController {

  constructor(private readonly preferenceService: PreferenceService) {}

  @Get()
  findAll() {
    return this.preferenceService.findAll();
  }

  @Post()
  create(@Body() createPreferenceDto: CreatePreferenceDto) {
    return this.preferenceService.create(createPreferenceDto);
  }

  @Patch(':key')
  update(@Param('key') key: string, @Body() updatePreferenceDto: UpdatePreferenceDto) {
    return this.preferenceService.update(key, updatePreferenceDto);
  }
}
