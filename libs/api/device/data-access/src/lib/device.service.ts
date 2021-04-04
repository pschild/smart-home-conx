import { Injectable } from '@nestjs/common';
import { DeleteResult, MongoRepository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './entity/device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class DeviceService {

  constructor(
    @InjectRepository(Device) private repository: MongoRepository<Device>
  ) {}

  create(createEspDto: CreateDeviceDto): Promise<Device> {
    return this.repository.save(createEspDto);
  }

  findAll(): Promise<Device[]> {
    return this.repository.find();
  }

  findOne(_id: string): Promise<Device> {
    return this.repository.findOne(_id);
  }

  update(_id: string, updateEspDto: UpdateDeviceDto): Promise<UpdateResult> {
    return this.repository.update(_id, updateEspDto);
  }

  remove(_id: string): Promise<DeleteResult> {
    return this.repository.delete(_id);
  }

}
