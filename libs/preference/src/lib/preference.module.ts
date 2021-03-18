import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Preference } from './entities/preference.entity';
import { PreferenceController } from './preference.controller';
import { PreferenceService } from './preference.service';

@Module({
  imports: [TypeOrmModule.forFeature([Preference])],
  controllers: [PreferenceController],
  providers: [PreferenceService],
  exports: [],
})
export class PreferenceModule {}
