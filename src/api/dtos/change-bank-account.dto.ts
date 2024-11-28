import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class ChangeBankAccountDto {
  @ApiProperty({
    description: 'Novo status da conta',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  @IsEnum(['active', 'inactive'])
  status: 'active' | 'inactive';
}
