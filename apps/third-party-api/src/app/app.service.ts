import { Injectable } from '@nestjs/common';
import { Cron, CronExpression, Interval } from '@nestjs/schedule';

@Injectable()
export class AppService {

  /* @Cron('45 * * * * *')
  handleCron() {
    console.log('Cron @' + new Date());
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCronExpression() {
    console.log('CronExpression @' + new Date());
  }

  @Interval(10000)
  handleInterval() {
    console.log('Interval @' + new Date());
  } */
}
