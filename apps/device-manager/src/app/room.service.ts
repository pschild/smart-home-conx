import { Injectable } from '@nestjs/common';
import { DeleteResult, MongoRepository, UpdateResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entity/room.entity';
import { CreateRoomDto, UpdateRoomDto } from './dto';
import { ObjectID } from 'mongodb';
import { SensorService } from './sensor.service';
import { from, Observable } from 'rxjs';
import { map, mergeAll, switchMap, toArray } from 'rxjs/operators';
import { Sensor } from './entity/sensor.entity';

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
    // return this.repository.find();

    const rooms$ = from(this.repository.find());
    return rooms$.pipe(
      mergeAll(),
      switchMap(room => this.getSensorsOfRoom(room).pipe(
        map(sensors => ({ ...room, sensors: room.sensors.map(s => ({...s, sensor: sensors.find(i => i._id.toString() === s.sensorId)})) })))
      ),
      toArray()
    ).toPromise();
  }

  findOne(roomId: string): Promise<Room> {
    // return this.repository.findOne(roomId);

    const room$ = from(this.repository.findOne(roomId));
    return room$.pipe(
      switchMap(room => this.getSensorsOfRoom(room).pipe(
        map(sensors => ({ ...room, sensors: room.sensors.map(s => ({...s, sensor: sensors.find(i => i._id.toString() === s.sensorId)})) })))
      )
    ).toPromise();
  }

  update(roomId: string, updateRoomDto: UpdateRoomDto): Promise<UpdateResult> {
    return this.repository.update(roomId, updateRoomDto);
  }

  remove(roomId: string): Promise<DeleteResult> {
    return this.repository.delete(roomId);
  }

  addSensor(roomId: string, dto: { sensorId: string; position: { x: number; y: number } }) {
    return this.repository.findOneAndUpdate(
      { _id: new ObjectID(roomId) },
      { $push: { sensors: { sensorId: dto.sensorId, position: dto.position } } },
      { returnOriginal: false }
    );
  }

  updateSensor(roomId: string, sensorId: string, dto: { position: { x: number; y: number } }) {
    return this.repository.findOneAndUpdate(
      { _id: new ObjectID(roomId), 'sensors.sensorId': sensorId },
      { $set: { 'sensors.$.position': dto.position } },
      { returnOriginal: false }
    );
  }

  removeSensor(roomId: string, sensorId: string) {
    return this.repository.findOneAndUpdate(
      { _id: new ObjectID(roomId) },
      { $pull: { sensors: { sensorId } } },
      { returnOriginal: false }
    );
  }

  getSensorsOfRoom(room: Room): Observable<Sensor[]> {
    return from(this.sensorService.findByIds(room.sensors.map(s => new ObjectID(s.sensorId))));
  }

}
