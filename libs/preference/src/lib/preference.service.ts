import { Injectable } from '@nestjs/common';
import { DeleteResult, MongoRepository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Preference } from './entities/preference.entity';
import { CreatePreferenceDto } from './dto/create-preference.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Injectable()
export class PreferenceService {

  constructor(
    @InjectRepository(Preference) private repository: MongoRepository<Preference>) {
  }

  create(createPreferenceDto: CreatePreferenceDto): Promise<Preference> {
    return this.repository.save(createPreferenceDto);
  }

  findAll(): Promise<Preference[]> {
    return this.repository.find();
  }

  findOne(_id: string): Promise<Preference> {
    return this.repository.findOne(_id);
  }

  update(_id: string, updatePreferenceDto: UpdatePreferenceDto): Promise<UpdateResult> {
    return this.repository.update(_id, updatePreferenceDto);
  }

  remove(_id: string): Promise<DeleteResult> {
    return this.repository.delete(_id);
  }
}
