import { Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLogDto } from './dto';
import { Log } from './entity/log.entity';

@Injectable()
export class LoggerService {

  constructor(
    @InjectRepository(Log) private repository: MongoRepository<Log>
  ) {}

  create(createLogDto: CreateLogDto): Promise<Log> {
    return this.repository.save(createLogDto);
  }

  findAll(): Promise<Log[]> {
    return this.repository.find();
  }
}
