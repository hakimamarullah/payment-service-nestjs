import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ErrorFilter,
  LoggingInterceptor,
} from '@hakimamarullah/commonbundle-nestjs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService: ConfigService = app.get<ConfigService>(ConfigService);
  const logger: Logger = new Logger(
    configService.get('APP_NAME', 'payment-service-nestjs'),
  );

  const server = app.getHttpServer();
  const proxyPrefix = configService.get<string>('PROXY_PREFIX', '');
  app.setGlobalPrefix(proxyPrefix);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ErrorFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Http Timeout
  server.requestTimeout = configService.get<number>(
    'SERVER_REQUEST_TIMEOUT',
    4000,
  );
  server.keepAliveTimeout = configService.get<number>(
    'SERVER_KEEP_ALIVE_TIMEOUT',
    10000,
  );

  const port: number = configService.get('SERVER_PORT', 3000);
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('SWAGGER_TITLE', 'Payment-Service'))
    .setDescription(
      configService.get<string>('SWAGGER_DESCRIPTION', 'Payment-Service API'),
    )
    .setVersion(configService.get<string>('APP_VERSION', '1.0'))
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`/swagger`, app, document, {
    jsonDocumentUrl: 'swagger/json',
    useGlobalPrefix: true,
  });

  app.listen(port).then(() => logger.log(`Server started on port ${port}`));
}
(async () => await bootstrap())();
