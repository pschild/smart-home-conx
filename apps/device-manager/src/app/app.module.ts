import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isDocker } from '@smart-home-conx/utils';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { Device } from './entity/device.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: isDocker() ? `mongodb` : `192.168.178.28`,
      port: 27017,
      database: 'device',
      // entities: [Preference, Esp], // omitted in favor of autoLoadEntities
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true,
      logging: 'all' // not possible in mongoDb
    }),
    TypeOrmModule.forFeature([Device])
  ],
  controllers: [DeviceController],
  providers: [DeviceService],
})
export class AppModule {}
