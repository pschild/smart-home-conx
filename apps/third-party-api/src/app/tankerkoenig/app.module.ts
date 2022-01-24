import { CacheModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isDocker } from '@smart-home-conx/utils';
import { StationDetail } from './entity/station.entity';
import { TankerkoenigController } from './tankerkoenig.controller';
import { TankerkoenigClient } from './tankerkoenig-client.service';
import { TankerkoenigStationService } from './station/station.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.register(),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: isDocker() ? `mongodb` : `localhost`,
      port: 27017,
      database: 'third-party-api_tankerkoenig',
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true
    }),
    TypeOrmModule.forFeature([StationDetail])
  ],
  controllers: [TankerkoenigController],
  providers: [TankerkoenigClient, TankerkoenigStationService]
})
export class TankerkoenigModule {}
