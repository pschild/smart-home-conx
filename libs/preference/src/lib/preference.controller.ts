import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { PreferenceService } from './preference.service';

@Controller('preference')
export class PreferenceController {

  constructor(private readonly preferenceService: PreferenceService) {}

  @Post()
  create(@Body() createPreferenceDto: CreatePreferenceDto) {
    return this.preferenceService.create(createPreferenceDto);
  }

  @Get()
  findAll() {
    return this.preferenceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') _id: string) {
    return this.preferenceService.findOne(_id);
  }

  @Patch(':id')
  update(@Param('id') _id: string, @Body() updatePreferenceDto: UpdatePreferenceDto) {
    return this.preferenceService.update(_id, updatePreferenceDto);
  }

  @Delete(':id')
  remove(@Param('id') _id: string) {
    return this.preferenceService.remove(_id);
  }
}
