import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsPositive } from 'class-validator';

export class TransferToBankAccountDto {
  @ApiProperty({
    description: 'Id da conta bancaria de origem',
    example: '01936ffa-cc36-7767-8f8f-9dd700417345',
  })
  @IsUUID()
  fromBankAccountId: string;

  @ApiProperty({
    description: 'Id da conta bancaria de destino',
    example: '01936ffa-cc36-7767-8f8f-9dd700417345',
  })
  @IsUUID()
  toBankAccountId: string;

  @ApiProperty({
    description: 'Valor a ser transferido em centavos',
    example: 100,
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  value: number;
}
