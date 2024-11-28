import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { Sequelize } from 'sequelize-typescript';
import { AddAccountCommand } from './application/commands/add-account/add-account-command';
import { ChangeBankAccountStatusCommand } from './application/commands/change-bank-account-status/change-bank-account-status-command';
import { DepositInBankAccountCommand } from './application/commands/deposit-in-bank-account/deposit-in-bank-account-command';
import { OpenAccountCommand } from './application/commands/open-account/open-account.command';
import { TransferToBankAccountCommand } from './application/commands/transfer-to-bank-account/transfer-to-bank-account.command';
import { WithdrawFromBankAccountCommand } from './application/commands/withdraw-from-bank-account/withdraw-from-bank-account.command';
import { FindBankAccountQuery } from './application/queries/find-bank-account/find-bank-account-query';
import { FindCustomerQuery } from './application/queries/find-customer/find-customer-query';
import { OpenAccountDto } from './api/dtos/open-account.dto';
import { ChangeBankAccountDto } from './api/dtos/change-bank-account.dto';
import { AddAccountDto } from './api/dtos/add-account.dto';
import { DepositInBankAccountDto } from './api/dtos/deposit-in-bank-account.dto';
import { WithdrawFromBankAccountDto } from './api/dtos/withdraw-from-bank-account-dto';
import { TransferToBankAccountDto } from './api/dtos/transfer-to-bank-account-dto';

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
  @ApiTags('Clientes')
  @ApiBody({
    type: OpenAccountDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Cliente criado com sucesso',
    example: {
      id: randomUUID(),
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados enviados são inválidos',
    examples: {
      'Cenário 01': {
        summary: 'Dados falharam na validação',
        value: {
          statusCode: 400,
          message: ['BirthDate must be a ISOString'],
          error: 'Bad Request',
        },
      },
      'Cenário 02': {
        summary: 'CPF inválido',
        value: {
          statusCode: 400,
          message: ['O CPF deve ser válido'],
          error: 'Bad Request',
        },
      },
      'Cenário 03': {
        summary: '',
        value: {
          statusCode: 400,
          message: ['O CPF já está em uso'],
          error: 'Bad Request',
        },
      },
    },
  })
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
  @ApiTags('Clientes')
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: '01936ffa-cc36-7767-8f8f-9dd700417345',
      fullName: 'Tertuliano Barros',
      document: '86997343791',
      birthDate: '2023-01-18T19:07:09.838Z',
      bankAccounts: [
        {
          id: '01936ffa-cc36-7767-8f8f-9dd80d4b8135',
          number: '01936ffa-cc55-7b1d-92fc-e5925a946328',
          status: 'active',
        },
        {
          id: '01936ffa-cc36-7767-8f8f-9dd80d4b8136',
          number: '01936ffa-cc55-7b1d-92fc-e5925a946321',
          status: 'inactive',
        },
      ],
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cliente não encontrado e ou id inválido',
    example: {
      statusCode: 400,
      message: ['Cliente não encontrado'],
      error: 'Bad Request',
    },
  })
  async findCustomerById(
    @Param('id')
    id: string,
  ) {
    return this.queryBus.execute(new FindCustomerQuery(id));
  }

  @Post('contas')
  @HttpCode(HttpStatus.CREATED)
  @ApiTags('Contas')
  @ApiBody({
    type: AddAccountDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Nova conta bancaria criada com sucesso',
    example: {
      id: '01936ffa-cc36-7767-8f8f-9dd700417345',
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cliente não encontrado e ou id inválido',
    example: {
      statusCode: 400,
      message: ['Cliente não encontrado'],
      error: 'Bad Request',
    },
  })
  async addNewAccount(
    @Body()
    input: AddAccountDto,
  ) {
    return this.commandBus.execute(new AddAccountCommand(input.customerId));
  }

  @Patch('contas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiTags('Contas')
  @ApiBody({
    type: ChangeBankAccountDto,
    examples: {
      'Alterar Status - Cenário 01': {
        summary: 'Ativando uma conta inativa',
        value: {
          status: 'active',
        },
      },
      'Alterar Status - Cenário  02': {
        summary: 'Desativando uma conta ativa',
        value: {
          status: 'inactive',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Status da conta alterado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Conta bancaria não encontrada, ou status inválido',
    example: {
      statusCode: 400,
      message: ['Conta bancaria não encontrada'],
      error: 'Bad Request',
    },
  })
  async changeBankAccountStatus(
    @Param('id')
    id: string,
    @Body()
    input: ChangeBankAccountDto,
  ) {
    return this.commandBus.execute(
      new ChangeBankAccountStatusCommand(id, input.status),
    );
  }

  @Get('contas/:id')
  @ApiTags('Contas')
  @ApiResponse({
    status: HttpStatus.OK,
    example: {
      id: '01936ffa-cc36-7767-8f8f-9dd700417345',
      fullName: 'Tertuliano Barros',
      document: '86997343791',
      birthDate: '2023-01-18T19:07:09.838Z',
      bankAccounts: [
        {
          id: '01936ffa-cc36-7767-8f8f-9dd80d4b8135',
          number: '01936ffa-cc55-7b1d-92fc-e5925a946328',
          status: 'active',
        },
        {
          id: '01936ffa-cc36-7767-8f8f-9dd80d4b8136',
          number: '01936ffa-cc55-7b1d-92fc-e5925a946321',
          status: 'inactive',
        },
      ],
    },
    examples: {
      'Conta sem transações': {
        summary: 'Conta sem transações',
        value: {
          id: '01937017-3e4e-7e34-ac6b-12628dd21385',
          balance: 0,
          status: 'inactive',
          customer: {
            id: '01937017-3e4e-7e34-ac6b-126185d44d14',
            fullName: 'John Doe2',
            document: '07487624005',
          },
          transactions: [],
        },
      },
      'conta com transações': {
        summary: 'Conta com transações',
        value: {
          id: '01937017-3e4e-7e34-ac6b-12628dd21385',
          balance: 1077,
          status: 'active',
          customer: {
            id: '01937017-3e4e-7e34-ac6b-126185d44d14',
            fullName: 'John Doe2',
            document: '07487624005',
          },
          transactions: [
            {
              id: '01937044-4ed8-74ec-b528-65747534d8f4',
              amount: 100,
              type: 'transfer',
              createdAt: '2024-11-28T00:55:45.112Z',
              toAccountId: '0193703d-60ea-727b-8d7d-b324adabb119',
            },
            {
              id: '01937044-4a0c-7282-94dc-30205c333fe1',
              amount: 100,
              type: 'transfer',
              createdAt: '2024-11-28T00:55:43.884Z',
              toAccountId: '0193703d-60ea-727b-8d7d-b324adabb119',
            },
            {
              id: '01937044-4422-7b0c-a383-90941100f24a',
              amount: 623,
              type: 'withdraw',
              createdAt: '2024-11-28T00:55:42.370Z',
              toAccountId: null,
            },
            {
              id: '01937044-35f8-7735-8acb-2fdc0e13b793',
              amount: 500,
              type: 'deposit',
              createdAt: '2024-11-28T00:55:38.744Z',
              toAccountId: null,
            },
            {
              id: '01937044-310a-7df1-b316-c9277073a2de',
              amount: 500,
              type: 'deposit',
              createdAt: '2024-11-28T00:55:37.482Z',
              toAccountId: null,
            },
            {
              id: '01937042-6f75-72bd-b155-7f4923a3f669',
              amount: 500,
              type: 'deposit',
              createdAt: '2024-11-28T00:53:42.389Z',
              toAccountId: null,
            },
            {
              id: '01937042-0837-73d0-90bb-ed8d9c8b4a92',
              amount: 100,
              type: 'transfer',
              createdAt: '2024-11-28T00:53:15.959Z',
              toAccountId: '0193703d-60ea-727b-8d7d-b324adabb119',
            },
            {
              id: '01937041-9559-7945-827f-81c4155615f1',
              amount: 500,
              type: 'deposit',
              createdAt: '2024-11-28T00:52:46.553Z',
              toAccountId: null,
            },
            {
              id: '01937041-78a4-7676-9e3e-5c57c08e287f',
              amount: 623,
              type: 'withdraw',
              createdAt: '2024-11-28T00:52:39.204Z',
              toAccountId: null,
            },
            {
              id: '0193702d-34bb-72d6-bf22-f7a7c3b368d5',
              amount: 500,
              type: 'deposit',
              createdAt: '2024-11-28T00:30:31.099Z',
              toAccountId: null,
            },
            {
              id: '0193702c-bc93-71c9-a6d7-da1dcde73415',
              amount: 123,
              type: 'deposit',
              createdAt: '2024-11-28T00:30:00.339Z',
              toAccountId: null,
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Conta bancaria não encontrada',
    example: {
      statusCode: 400,
      message: ['Conta bancaria não encontrada'],
      error: 'Bad Request',
    },
  })
  async findBankAccountById(
    @Param('id')
    id: string,
  ) {
    return this.queryBus.execute(new FindBankAccountQuery(id));
  }

  @Post('movimentacoes/deposito')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiTags('Movimentações')
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Deposito realizado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,

    description: 'Erro na regra de negocio',
    example: {
      statusCode: 400,
      message: ['Conta bancaria não encontrada'],
      error: 'Bad Request',
    },
  })
  async depositInBankAccount(
    @Body()
    input: DepositInBankAccountDto,
  ) {
    await this.commandBus.execute(
      new DepositInBankAccountCommand(input.bankAccountId, input.value),
    );
  }

  @Post('movimentacoes/saque')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiTags('Movimentações')
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Saque realizado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Erro na regra de negocio',
    example: {
      statusCode: 400,
      message: ['Conta bancaria não encontrada'],
      error: 'Bad Request',
    },
  })
  async withdraw(
    @Body()
    input: WithdrawFromBankAccountDto,
  ) {
    await this.commandBus.execute(
      new WithdrawFromBankAccountCommand(input.bankAccountId, input.value),
    );
  }

  @Post('movimentacoes/transferencia')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiTags('Movimentações')
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Transferência realizada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Erro na regra de negocio',
    example: {
      statusCode: 400,
      message: [
        'Conta bancaria não encontrada',
        'Conta bancaria de destino não encontrada',
      ],
      error: 'Bad Request',
    },
  })
  async transferToBankAccount(
    @Body()
    input: TransferToBankAccountDto,
  ) {
    await this.commandBus.execute(
      new TransferToBankAccountCommand(
        input.fromBankAccountId,
        input.toBankAccountId,
        input.value,
      ),
    );
  }
}
