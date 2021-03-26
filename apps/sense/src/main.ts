/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const port = 3334;
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      retryAttempts: 5,
      retryDelay: 3000,
      // host: order_host,
      port
    }
  });

  await app.startAllMicroservicesAsync();
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  // app.enableCors();
  await app.listen(port, () => {
    Logger.log('Microservice listening on port ' + port);
    Logger.log('REST interface listening at http://localhost:' + port + '/' + globalPrefix);
  });
}
bootstrap();
