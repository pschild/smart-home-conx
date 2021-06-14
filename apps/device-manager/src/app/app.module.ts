import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isDocker } from '@smart-home-conx/utils';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { Device } from './entity/device.entity';
import { Room } from './entity/room.entity';
import { Sensor } from './entity/sensor.entity';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { SensorController } from './sensor.controller';
import { SensorService } from './sensor.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: isDocker() ? `mongodb` : `localhost`,
      port: 27017,
      database: 'device-manager',
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true
    }),
    TypeOrmModule.forFeature([Device, Sensor, Room])
  ],
  controllers: [DeviceController, SensorController, RoomController],
  providers: [DeviceService, SensorService, RoomService],
})
export class AppModule {}
