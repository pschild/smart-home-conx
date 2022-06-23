import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class EspPayloadPipe implements PipeTransform {
  transform(value: any) {
    return {
      ...value,
      value: !!value.value ? +value.value : null,
      pin: !!value.pin ? +value.pin : null
    };
  }
}