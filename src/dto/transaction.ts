import { IsNotEmpty, IsString, IsNumber, IsEnum, IsIn, IsInt, Min, IsOptional, IsDateString, ValidateIf } from 'class-validator'

import { SUPPORTED_CURRENCIES, SupportedCurrency } from '../constants/currencies'

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsString()
  accountId: string

  @IsNotEmpty()
  @IsEnum(['INBOUND', 'OUTBOUND'])
  type: 'INBOUND' | 'OUTBOUND'

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number

  @IsNotEmpty()
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES, {
    message: `Unsupported currency detected: $value`,
  })
  currency: SupportedCurrency
}

export class ListTransactionsDto {
  @IsNotEmpty()
  @IsString()
  accountId: string

  @IsOptional()
  @ValidateIf((_, value) => !!value)
  @IsInt()
  skip?: number | null

  @IsOptional()
  @ValidateIf((_, value) => !!value)
  @IsInt()
  limit?: number | null

  @IsOptional()
  @IsDateString()
  from?: Date;

  @IsOptional()
  @IsDateString()
  to?: Date;
}
