import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { CreateSensorDto, UpdateSensorDto } from './dto';

@Controller('sensor')
export class SensorController {

  constructor(
    private readonly sensorService: SensorService
  ) {}

  @Post()
  create(@Body() createSensorDto: CreateSensorDto) {
    return this.sensorService.create(createSensorDto);
  }

  @Get()
  findAll() {
    return this.sensorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') sensorId: string) {
    return this.sensorService.findOne(sensorId);
  }

  @Get('/byDevice/:deviceId')
  findByDeviceId(@Param('deviceId') deviceId: string) {
    return this.sensorService.findByDeviceId(deviceId);
  }

  @Patch(':id')
  update(@Param('id') sensorId: string, @Body() updateSensorDto: UpdateSensorDto) {
    return this.sensorService.update(sensorId, updateSensorDto);
  }

  @Delete(':id')
  remove(@Param('id') sensorId: string) {
    return this.sensorService.remove(sensorId);
  }
}
