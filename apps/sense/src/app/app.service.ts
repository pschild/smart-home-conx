import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getSense(): number {
    return 42;
  }
}
