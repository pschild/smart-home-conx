import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { isDocker } from '@smart-home-conx/utils';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
  const port = 9092;
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: { host: isDocker() ? 'device-manager' : 'localhost', retryAttempts: 5, retryDelay: 3000 } // do not specify the port because that leads to EADDRINUSE error when running in docker container
  });

  await app.startAllMicroservicesAsync();
  // app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port, () => {
    Logger.log('Microservice listening on port ' + port);
    Logger.log('REST interface listening at http://localhost:' + port);
    Logger.log(`running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  });
}

bootstrap();