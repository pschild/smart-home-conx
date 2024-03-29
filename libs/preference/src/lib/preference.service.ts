import { Injectable } from '@nestjs/common';
import { MongoRepository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Preference } from './entity/preference.entity';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { CreatePreferenceDto } from './dto/create-preference.dto';

@Injectable()
export class PreferenceService {

  constructor(
    @InjectRepository(Preference) private repository: MongoRepository<Preference>
  ) {}

  create(createPreferenceDto: CreatePreferenceDto): Promise<Preference> {
    return this.repository.save(createPreferenceDto);
  }

  findAll(): Promise<Preference[]> {
    return this.repository.find();
  }

  async getValueFor(key: string): Promise<any> {
    return (await this.repository.findOne({ where: { key } })).value;
  }

  update(key: string, updatePreferenceDto: UpdatePreferenceDto): Promise<UpdateResult> {
    return this.repository.update({ key }, updatePreferenceDto);
  }

}
