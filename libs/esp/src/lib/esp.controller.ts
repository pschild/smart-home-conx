import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CreateEspDto } from './dto/create-esp.dto';
import { UpdateEspDto } from './dto/update-esp.dto';
import { EspService } from './esp.service';

@Controller('esp')
export class EspController {

  constructor(private readonly espService: EspService) {}

  @Post()
  create(@Body() createEspDto: CreateEspDto) {
    return this.espService.create(createEspDto);
  }

  @Get()
  findAll() {
    return this.espService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') _id: string) {
    return this.espService.findOne(_id);
  }

  @Patch(':id')
  update(@Param('id') _id: string, @Body() updateEspDto: UpdateEspDto) {
    return this.espService.update(_id, updateEspDto);
  }

  @Delete(':id')
  remove(@Param('id') _id: string) {
    return this.espService.remove(_id);
  }
}
