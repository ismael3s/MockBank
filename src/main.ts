import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { SequelizeStorage, Umzug } from 'umzug';
import { Sequelize } from 'sequelize-typescript';
import * as cls from 'cls-hooked';
import { ApplicationExceptionFilter } from './api/filters/application-exception.filter';
import { CatchEverythingFilter } from './api/filters/catch-everything-exception.filter';
import { Logger } from 'nestjs-pino';
const namespace = cls.createNamespace('mock_bank_cls');
Sequelize.useCLS(namespace);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const sequelize = app.get(Sequelize);
  const logger = app.get(Logger);
  const httpAdapterHost = app.get(HttpAdapterHost);
  const umzug = new Umzug({
    migrations: {
      glob: __dirname + '/**/sequelize/migrations/*.js',
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });
  await umzug.up();
  app
    .useGlobalPipes(new ValidationPipe())
    .useGlobalFilters(new CatchEverythingFilter(httpAdapterHost, logger))
    .useGlobalFilters(new ApplicationExceptionFilter())
    .useLogger(logger);
  const config = new DocumentBuilder()
    .setTitle('MockBank')
    .setDescription('API para simular um banco')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/docs', app, documentFactory);
  await app.listen(3000);
}
bootstrap();
