import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString } from 'class-validator';

export class OpenAccountDto {
  @ApiProperty({
    description: 'Nome completo do cliente',
    example: 'Fulano de Tal',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'CPF do cliente',
    example: '123.456.789-00',
  })
  @IsString()
  document: string;

  @ApiProperty({
    description: 'Data de nascimento do cliente no formato ISO 8601',
    example: '2000-05-12T15:00:00.000Z',
  })
  @IsDateString()
  birthDate: Date;
}
