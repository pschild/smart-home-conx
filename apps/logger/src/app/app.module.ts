import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogModule } from '@smart-home-conx/log';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: `192.168.178.28`,
      port: 27017,
      database: 'logs',
      // entities: [LogEntry], // omitted in favor of autoLoadEntities
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true,
      logging: 'all' // not possible in mongoDb
    }),
    LogModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
