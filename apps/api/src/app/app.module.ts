import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreferenceModule, Preference } from '@smart-home-conx/preference';
import { EspModule, Esp } from '@smart-home-conx/esp';
import { isDocker } from '@smart-home-conx/utils';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // type: 'sqlite',
      // database: './db.sqlite',
      type: 'mongodb',
      host: isDocker() ? `localhost` : `192.168.178.28`,
      port: 27017,
      database: 'test',
      // entities: [Preference, Esp], // omitted in favor of autoLoadEntities
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true,
      logging: 'all' // not possible in mongoDb
    }),
    PreferenceModule,
    EspModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
