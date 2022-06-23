import { Injectable } from '@nestjs/common';
import { DeleteResult, MongoRepository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Device } from './entity/device.entity';
import { CreateDeviceDto, UpdateDeviceDto } from './dto';
import { ConnectionStatus } from '@smart-home-conx/api/shared/data-access/models';

@Injectable()
export class DeviceService {

  constructor(
    @InjectRepository(Device) private repository: MongoRepository<Device>
  ) {}

  create(createEspDto: CreateDeviceDto): Promise<Device> {
    return this.repository.save({ ...createEspDto, connectionStatus: ConnectionStatus.UNKNOWN, connectionStatusChangedAt: null, lastPing: null });
  }

  findAll(): Promise<Device[]> {
    // TODO: incl. Sensors?
    return this.repository.find();
  }

  findOne(deviceId: string): Promise<Device> {
    // TODO: incl. Sensors?
    return this.repository.findOne(deviceId);
  }

  findByChipId(chipId: string): Promise<Device> {
    // TODO: incl. Sensors?
    return this.repository.findOne({ chipId: +chipId });
  }

  update(deviceId: string, updateEspDto: UpdateDeviceDto): Promise<UpdateResult> {
    return this.repository.update(deviceId, updateEspDto);
  }

  remove(deviceId: string): Promise<DeleteResult> {
    return this.repository.delete(deviceId);
  }

}
