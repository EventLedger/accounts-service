import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsIn,
} from 'class-validator'

import {
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
} from '../constants/currencies'

export class CreateAccountDto {
  @IsNotEmpty()
  @IsString()
  customerId: string

  @IsNotEmpty()
  @IsString()
  accountNumber: string

  @IsArray()
  @IsNotEmpty()
  @IsIn(SUPPORTED_CURRENCIES, {
    each: true,
    message: 'Unsupported currency detected',
  })
  currencies: SupportedCurrency[]
}

export class UpdateAccountDto {
  @IsString()
  @IsOptional()
  customerId?: string

  @IsString()
  @IsOptional()
  accountNumber?: string

  @IsArray()
  @IsIn(SUPPORTED_CURRENCIES, {
    each: true,
    message: 'Unsupported currency detected',
  })
  @IsOptional()
  currencies?: SupportedCurrency[]
}
