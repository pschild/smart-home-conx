import { Module } from '@nestjs/common';
import { TelegramController, TelegramService } from './telegram';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isDocker } from '@smart-home-conx/utils';
import { PreferenceController } from './preference/preference.controller';
import { PreferenceService } from './preference/preference.service';
import { Preference } from './preference/entity/preference.entity';
import { InitialPreferences1618563524000 } from '../migration/1618563524000-InitialPreferences';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: isDocker() ? `mongodb` : `localhost`,
      port: 27017,
      database: 'messenger-connector',
      // entities: [Preference], // omitted in favor of autoLoadEntities
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true,
      migrations: [InitialPreferences1618563524000],
      migrationsRun: true,
      logging: 'all' // not possible in mongoDb
    }),
    TypeOrmModule.forFeature([Preference])
  ],
  controllers: [TelegramController, PreferenceController],
  providers: [TelegramService, PreferenceService],
})
export class AppModule {}
