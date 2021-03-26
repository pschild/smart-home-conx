import { Injectable } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { LogEntry } from './entities/log-entry.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLogEntryDto } from './dto/create-log-entry.dto';

@Injectable()
export class LogService {

  constructor(
    @InjectRepository(LogEntry) private repository: MongoRepository<LogEntry>
  ) {}

  create(createLogEntryDto: CreateLogEntryDto) {
    console.log(`create log ${createLogEntryDto.message}`);
    return this.repository.save(createLogEntryDto);
  }

  findAll() {
    return this.repository.find();
  }
}
