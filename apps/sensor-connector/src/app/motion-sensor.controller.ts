import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, MqttContext, Payload } from '@nestjs/microservices';

@Controller()
export class MotionSensorController {

  @MessagePattern('ESP_7888034/movement')
  create(@Payload() payload: any, @Ctx() context: MqttContext) {
    console.log('movement detected!');
    // return this.motionSensorService.create(dto);
  }

}
