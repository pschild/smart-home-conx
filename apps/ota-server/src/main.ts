import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
// TODO: with v8 of NestJs, this adapter can be used instead of the custom one
// import { IoAdapter } from '@nestjs/platform-socket.io';
import { IoAdapter } from './app/io-adapter';
import { environment } from './environments/environment';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const port = 9042;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(port, () => {
    Logger.log('REST interface listening at http://localhost:' + port);
    Logger.log(`running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  });
}

bootstrap();
