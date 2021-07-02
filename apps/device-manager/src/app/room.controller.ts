import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto, UpdateRoomDto } from './dto';

@Controller('room')
export class RoomController {

  constructor(private readonly roomService: RoomService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') roomId: string) {
    return this.roomService.findOne(roomId);
  }

  @Patch(':id')
  update(@Param('id') roomId: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(roomId, updateRoomDto);
  }

  @Delete(':id')
  remove(@Param('id') roomId: string) {
    return this.roomService.remove(roomId);
  }

}
