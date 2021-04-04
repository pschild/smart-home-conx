import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const port = 9053;
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice({
    transport: Transport.MQTT,
    options: { url: 'mqtt://192.168.178.28:1883', clientId: 'sensor-connector' }
  });

  await app.startAllMicroservicesAsync();
  // app.enableCors();
  // app.useGlobalPipes(new ValidationPipe());
  await app.listen(port, () => {
    Logger.log('Microservice listening on port ' + port);
    Logger.log('REST interface listening at http://localhost:' + port);
  });
}

bootstrap();