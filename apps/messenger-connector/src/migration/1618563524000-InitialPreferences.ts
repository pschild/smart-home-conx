import { log } from '@smart-home-conx/utils';
import { getRepository, MigrationInterface } from 'typeorm';
import { MongoQueryRunner } from 'typeorm/driver/mongodb/MongoQueryRunner';
import { Preference } from '@smart-home-conx/preference';

export class InitialPreferences1618563524000 implements MigrationInterface {
  async up(queryRunner: MongoQueryRunner): Promise<any> {
    const repository = getRepository(Preference);
    const count = await repository.count();
    if (!count) {
      log(`Creating default preferences...`);
      await repository.save([
        { key: 'telegramEnabled', label: 'Telegram Bot aktiviert', value: true },
        { key: 'whatsAppEnabled', label: 'WhatsApp Bot aktiviert', value: false }
      ]);
    }
  }

  async down(queryRunner: MongoQueryRunner): Promise<any> {
    return null;
  }
}