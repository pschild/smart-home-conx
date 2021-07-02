import { Injectable } from '@nestjs/common';
import { DeleteResult, MongoRepository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entity/room.entity';
import { CreateRoomDto, UpdateRoomDto } from './dto';
import { SensorService } from './sensor.service';

@Injectable()
export class RoomService {

  constructor(
    @InjectRepository(Room) private repository: MongoRepository<Room>,
    private sensorService: SensorService
  ) {}

  create(createRoomDto: CreateRoomDto): Promise<Room> {
    return this.repository.save(createRoomDto);
  }

  findAll(): Promise<Room[]> {
    return this.repository.find();
  }

  findOne(roomId: string): Promise<Room> {
    return this.repository.findOne(roomId);
  }

  update(roomId: string, updateRoomDto: UpdateRoomDto): Promise<UpdateResult> {
    return this.repository.update(roomId, updateRoomDto);
  }

  remove(roomId: string): Promise<DeleteResult> {
    return this.repository.delete(roomId);
  }

}
