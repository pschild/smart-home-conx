import { Injectable } from '@nestjs/common';
import { DeleteResult, MongoRepository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSensorDto, UpdateSensorDto } from './dto';
import { Sensor } from './entity/sensor.entity';

@Injectable()
export class SensorService {

  constructor(
    @InjectRepository(Sensor) private repository: MongoRepository<Sensor>
  ) {}

  create(createSensorDto: CreateSensorDto): Promise<Sensor> {
    return this.repository.save(createSensorDto);
  }

  findByIds(sensorIds: string[]): Promise<Sensor[]> {
    return this.repository.findByIds(sensorIds);
  }

  findAll(): Promise<Sensor[]> {
    return this.repository.find();
  }

  findOne(sensorId: string): Promise<Sensor> {
    return this.repository.findOne(sensorId);
  }

  findByChipId(chipId: string): Promise<Sensor[]> {
    return this.repository.find({ where: { chipId } });
  }

  findByCriteria(criteria: Partial<Sensor>): Promise<Sensor> {
    const { chipId, type, pin } = criteria;
    return this.repository.findOne({ where: { chipId, type, pin } });
  }

  findByRoomId(roomId: string): Promise<Sensor[]> {
    return this.repository.find({ where: { roomId } });
  }

  update(sensorId: string, updateSensorDto: UpdateSensorDto): Promise<UpdateResult> {
    return this.repository.update(sensorId, updateSensorDto);
  }

  remove(sensorId: string): Promise<DeleteResult> {
    return this.repository.delete(sensorId);
  }

}
