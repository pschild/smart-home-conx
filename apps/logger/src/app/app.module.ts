import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isDocker } from '@smart-home-conx/utils';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';
import { Log } from './entity/log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: isDocker() ? `mongodb` : `192.168.178.28`,
      port: 27017,
      database: 'log',
      // entities: [Log], // omitted in favor of autoLoadEntities
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true,
      logging: 'all' // not possible in mongoDb
    }),
    TypeOrmModule.forFeature([Log])
  ],
  controllers: [LoggerController],
  providers: [LoggerService],
})
export class AppModule {}
