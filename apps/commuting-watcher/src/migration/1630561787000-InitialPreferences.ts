import { log } from '@smart-home-conx/utils';
import { getRepository, MigrationInterface } from 'typeorm';
import { MongoQueryRunner } from 'typeorm/driver/mongodb/MongoQueryRunner';
import { Preference } from '@smart-home-conx/preference';

export class InitialPreferences1630561787000 implements MigrationInterface {
  async up(queryRunner: MongoQueryRunner): Promise<any> {
    const repository = getRepository(Preference);
    const count = await repository.count();
    if (!count) {
      log(`Creating default preferences...`);
      await repository.save([
        { key: 'alexaEnabled', label: 'Sprachausgabe über Alexa aktiviert', value: true },
        { key: 'saveScreenshotsEnabled', label: 'Screenshots speichern', value: true },
      ]);
    }
  }

  async down(queryRunner: MongoQueryRunner): Promise<any> {
    return null;
  }
}