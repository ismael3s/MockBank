import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsPositive } from 'class-validator';

export class DepositInBankAccountDto {
  @ApiProperty({
    description: 'Id da conta bancaria',
    example: '01936ffa-cc36-7767-8f8f-9dd700417345',
  })
  @IsUUID()
  bankAccountId: string;

  @ApiProperty({
    description: 'Valor a ser depositado em centavos',
    example: 100,
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  value: number;
}
