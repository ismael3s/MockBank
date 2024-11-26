import { Body, Controller, Get, Injectable, Post } from '@nestjs/common';
import { CommandBus, IEventBus } from '@nestjs/cqrs';
import { Sequelize } from 'sequelize-typescript';
import { OpenAccountCommand } from './application/commands/open-account/open-account.command';

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
  ) {}

  @Get()
  async getHello() {
    return this.sequelize.models.CustomerModel.findAll();
  }

  @Post('clientes')
  async aa(
    @Body()
    body: OpenAccountDto,
  ) {
    await this.commandBus.execute(
      new OpenAccountCommand(body.fullName, body.document, body.birthDate),
    );
  }
}
