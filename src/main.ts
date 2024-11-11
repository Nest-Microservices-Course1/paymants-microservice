import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const logger = new Logger('Payments-ms');

  // Comunicación rest
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Comunicación nats
  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.NATS,
      options: {
        servers: envs.natsServers,
      },
    },
    { inheritAppConfig: true }, // Heredar global pipes de la aplicación principal
  );

  await app.startAllMicroservices();
  await app.listen(envs.port);

  logger.log(
    `Payments microservice running on port http://localhost:${envs.port}`,
  );
}
bootstrap();
