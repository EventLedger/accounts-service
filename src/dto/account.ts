import {
  IsNotEmpty,
  IsString,
  IsArray,
  IsOptional,
  IsIn,
  IsObject,
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

  // Making it optional, as balances might not be set on creation
  @IsOptional()
  @IsObject({ message: 'balances must be an object' })
  balances?: { [key: string]: number }
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

  @IsOptional()
  @IsObject({ message: 'balances must be an object' })
  balances?: Record<string, number>
}
