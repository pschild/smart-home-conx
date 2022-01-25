import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { isDocker } from '@smart-home-conx/utils';
import { AutoRemoveController } from './auto-remove.controller';
import { Notification } from './notification/entity/notification.entity';
import { NotificationController } from './notification/notification.controller';
import { NotificationService } from './notification/notification.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      host: isDocker() ? `mongodb` : `localhost`,
      port: 27017,
      database: 'notification-manager',
      autoLoadEntities: true, // with that option specified, every entity registered through the forFeature() method will be automatically added to the entities array
      synchronize: true
    }),
    TypeOrmModule.forFeature([Notification])
  ],
  controllers: [AutoRemoveController, NotificationController],
  providers: [NotificationService],
})
export class AppModule {}
