import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { isDocker } from '@smart-home-conx/utils';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

async function bootstrap() {
  const port = 9112;
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.MQTT,
    options: { url: isDocker() ? `mqtt://mqtt-broker:1883` : `mqtt://localhost:1883`, clientId: 'notification-manager' }
  });

  await app.startAllMicroservices();
  // app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port, () => {
    Logger.log('Microservice listening on port ' + port);
    Logger.log('REST interface listening at http://localhost:' + port);
    Logger.log(`running in ${environment.production ? 'PRODUCTION' : 'DEVELOPMENT'}`);
  });
}

bootstrap();
