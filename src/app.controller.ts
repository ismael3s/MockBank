import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Injectable,
  Param,
  Post,
} from '@nestjs/common';
import { CommandBus, IEventBus, QueryBus } from '@nestjs/cqrs';
import { Sequelize } from 'sequelize-typescript';
import { OpenAccountCommand } from './application/commands/open-account/open-account.command';
import { FindCustomerQuery } from './application/queries/find-customer/find-customer-query';

export class OpenAccountDto {
  fullName: string;
  document: string;
  birthDate: Date;
}

@Controller()
export class AppController {
  constructor(
    private readonly sequelize: Sequelize,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getHello() {
    return this.sequelize.models.CustomerModel.findAll();
  }

  @Post('clientes')
  @HttpCode(HttpStatus.CREATED)
  async openAccount(
    @Body()
    body: OpenAccountDto,
  ) {
    return this.commandBus.execute(
      new OpenAccountCommand(body.fullName, body.document, body.birthDate),
    );
  }

  @Get('clientes/:id')
  async findCustomerById(
    @Param('id')
    id: string,
  ) {
    return this.queryBus.execute(new FindCustomerQuery(id));
  }
}
