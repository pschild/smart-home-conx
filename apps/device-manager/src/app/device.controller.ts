import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { DeviceService } from './device.service';
import { CreateDeviceDto, UpdateDeviceDto } from './dto';

@Controller()
export class DeviceController {

  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  create(@Body() createEspDto: CreateDeviceDto) {
    return this.deviceService.create(createEspDto);
  }

  @Get()
  @MessagePattern('loadDeviceList')
  findAll() {
    return this.deviceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') _id: string) {
    return this.deviceService.findOne(_id);
  }

  @Patch(':id')
  update(@Param('id') _id: string, @Body() updateEspDto: UpdateDeviceDto) {
    return this.deviceService.update(_id, updateEspDto);
  }

  @Delete(':id')
  remove(@Param('id') _id: string) {
    return this.deviceService.remove(_id);
  }
}
