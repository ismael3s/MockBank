import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddAccountDto {
  @ApiProperty({
    description: 'Id do cliente',
    example: '01936ffa-cc36-7767-8f8f-9dd700417345',
  })
  @IsUUID()
  customerId: string;
}
