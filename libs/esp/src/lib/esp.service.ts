import { Injectable } from '@nestjs/common';
import { DeleteResult, MongoRepository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Esp } from './entities/esp.entity';
import { CreateEspDto } from './dto/create-esp.dto';
import { UpdateEspDto } from './dto/update-esp.dto';

@Injectable()
export class EspService {

  constructor(
    @InjectRepository(Esp) private repository: MongoRepository<Esp>) {
  }

  create(createEspDto: CreateEspDto): Promise<Esp> {
    return this.repository.save(createEspDto);
  }

  findAll(): Promise<Esp[]> {
    return this.repository.find();
  }

  findOne(_id: string): Promise<Esp> {
    return this.repository.findOne(_id);
  }

  update(_id: string, updateEspDto: UpdateEspDto): Promise<UpdateResult> {
    return this.repository.update(_id, updateEspDto);
  }

  remove(_id: string): Promise<DeleteResult> {
    return this.repository.delete(_id);
  }
}
