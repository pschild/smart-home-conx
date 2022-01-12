import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository, ObjectID, UpdateResult } from 'typeorm';
import { CreateStationDto } from '../dto/create-station.dto';
import { UpdateStationDto } from '../dto/update-station.dto';
import { StationDetail } from '../entity/station.entity';

@Injectable()
export class TankerkoenigStationService {

  constructor(
    @InjectRepository(StationDetail) private repository: MongoRepository<StationDetail>
  ) {}

  create(createDto: CreateStationDto): Promise<StationDetail> {
    return this.repository.save(createDto);
  }

  findAll(): Promise<StationDetail[]> {
    return this.repository.find();
  }

  findOne(stationId: string): Promise<StationDetail> {
    return this.repository.findOne({ id: stationId });
  }

  update(id: ObjectID, updateDto: UpdateStationDto): Promise<UpdateResult> {
    return this.repository.update(id, updateDto);
  }
}
