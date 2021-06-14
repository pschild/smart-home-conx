import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preference } from './entity/preference.entity';
import { PreferenceController } from './preference.controller';
import { PreferenceService } from './preference.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Preference])
  ],
  controllers: [PreferenceController],
  providers: [PreferenceService],
  exports: [PreferenceService],
})
export class PreferenceModule {}
