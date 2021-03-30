import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const port = 9092;
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { retryAttempts: 5, retryDelay: 3000 } // do not specify the port because that leads to EADDRINUSE error when running in docker container
  });

  await app.startAllMicroservicesAsync();
  // app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port, () => {
    Logger.log('Microservice listening on port ' + port);
    Logger.log('REST interface listening at http://localhost:' + port);
  });
}

bootstrap();