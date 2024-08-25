import { IsNotEmpty, IsString, IsNumber, IsEnum, IsIn } from 'class-validator';

import {
  SUPPORTED_CURRENCIES,
  SupportedCurrency,
} from '../constants/currencies';

export class CreateTransactionDto {
  @IsNotEmpty()
  @IsString()
  accountId: string;

  @IsNotEmpty()
  @IsEnum(['INBOUND', 'OUTBOUND'])
  type: 'INBOUND' | 'OUTBOUND';

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(SUPPORTED_CURRENCIES, {
    message: `Unsupported currency detected: $value`,
  })
  currency: SupportedCurrency;
}
