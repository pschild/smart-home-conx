import { Module } from '@nestjs/common';
import { TelegramController, TelegramService } from './telegram';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isDocker } from '@smart-home-conx/utils';
import { InitialPreferences1618563524000 } from '../migration/1618563524000-InitialPreferences';
import { PreferenceModule } from '@smart-home-conx/preference';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: isDocker() ? `mongodb` : `localhost`,
      port: 27017,
      database: 'messenger-connector',
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true,
      migrations: [InitialPreferences1618563524000],
      migrationsRun: true
    }),
    PreferenceModule
  ],
  controllers: [TelegramController],
  providers: [TelegramService],
})
export class AppModule {}
