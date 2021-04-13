import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { log } from '@smart-home-conx/utils';

export const EspRequestHeader = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const headers = ctx.switchToHttp().getRequest().headers;
    if (!originateFromEsp(headers)) {
      log(`URL accessed by an unknown origin. Headers: ${JSON.stringify(headers)}`);
      throw new HttpException('Request did not originate from an ESP. Aborting!', HttpStatus.BAD_REQUEST);
    }
    return headers;
  },
);

const originateFromEsp = headers => {
  return headers['user-agent']
  && headers['user-agent'] === 'ESP8266-http-Update'
  && headers['x-esp8266-chip-id'] // ex. 226047
  && headers['x-esp8266-sta-mac'] // ex. 4C:11:AE:03:72:FF
  && headers['x-esp8266-free-space'] // ex. 462848
  && headers['x-esp8266-sketch-size'] // ex. 301408
  && headers['x-esp8266-sketch-md5'] // ex. 18f8dc4ccb5bbb8b909a7ed1a8b5f173
  && headers['x-esp8266-chip-size'] // ex. 1048576
  && headers['x-esp8266-sdk-version'] // ex. 2.2.2-dev(38a443e)
  // && headers['x-esp8266-version'] // ex. esp-mqtt_v0.2.3
  ;
}
