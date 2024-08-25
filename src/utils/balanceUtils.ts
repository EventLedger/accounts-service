import { IAccount } from '../models/account'
import { BadRequestException } from './exceptions'
import { CreateAccountDto } from '../dto/account'
import { SupportedCurrency } from '../constants/currencies'

export function validateCurrenciesInBalance(
  balances: CreateAccountDto['balances'],
  supportedCurrencies: SupportedCurrency[]
) {
  for (const currency in balances) {
    if (!supportedCurrencies.includes(currency as SupportedCurrency)) {
      throw new BadRequestException(`Unsupported currency in balances: ${currency}`)
    }
  }
}

export function initializeBalancesObject(createAccountDto: CreateAccountDto) {
  createAccountDto.balances = {}
  createAccountDto.currencies.forEach((currency) => (createAccountDto.balances[currency] = 0))
}

export function updateBalancesForNewCurrencies(
  existingAccount: IAccount,
  newCurrencies: SupportedCurrency[]
) {
  for (const currency of existingAccount.balances.keys()) {
    if (!newCurrencies.includes(currency as SupportedCurrency)) {
      existingAccount.balances.delete(currency)
    }
  }

  for (const currency of newCurrencies) {
    if (!existingAccount.balances.has(currency)) {
      existingAccount.balances.set(currency, 0)
    }
  }
}
