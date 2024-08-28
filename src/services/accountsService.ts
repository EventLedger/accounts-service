import { Model } from 'mongoose'

import { Account, IAccount } from '../models/account'
import { CreateAccountDto, UpdateAccountDto } from '../dto/account'
import { BadRequestException, NotFoundException } from '../utils/exceptions'
import { SupportedCurrency } from '../constants/currencies'
import { AwsEventBridgeService } from './awsEventBridgeService'

export class AccountsService {
  private accountModel: Model<IAccount>
  private eventBridgeService: AwsEventBridgeService;

  constructor() {
    this.accountModel = Account
    this.eventBridgeService = new AwsEventBridgeService()
  }

  async createAccount(createAccountDto: CreateAccountDto): Promise<IAccount> {
    if (createAccountDto.balances) {
      this.validateCurrenciesInBalance(
        createAccountDto.balances,
        createAccountDto.currencies,
      )
    } else {
      this.initializeBalancesObject(createAccountDto)
    }

    const newAccount = new this.accountModel(createAccountDto)
    await newAccount.save()
    
    this.eventBridgeService.publishEvent('AccountCreated', newAccount);
    return newAccount
  }

  async getAccount(accountId: string): Promise<IAccount> {
    const account = await this.accountModel.findById(accountId).exec()

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`)
    }
    return account
  }

  async updateAccount(
    accountId: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<IAccount> {
    const account = await this.getAccount(accountId)

    if (updateAccountDto.currencies) {
      this.updateBalancesForNewCurrencies(account, updateAccountDto.currencies)
    }

    if (updateAccountDto.balances) {
      this.validateCurrenciesInBalance(
        updateAccountDto.balances,
        updateAccountDto.currencies || account.currencies,
      )
    }

    Object.assign(account, updateAccountDto)
    const updatedAccount = await account.save()

    this.eventBridgeService.publishEvent('AccountUpdated', updatedAccount);
    return updatedAccount
  }

  private validateCurrenciesInBalance(
    balances: CreateAccountDto['balances'] = {},
    supportedCurrencies: SupportedCurrency[],
  ) {
    for (const currency in balances) {
      if (!supportedCurrencies.includes(currency as SupportedCurrency)) {
        throw new BadRequestException(
          `Unsupported currency in balances: ${currency}`,
        )
      }

      const amount = balances[currency]
      if (amount <= 0) {
        throw new BadRequestException(
          `Invalid amount for currency ${currency}: ${amount}. Amount must be a positive number.`,
        )
      }
    }

    supportedCurrencies.forEach(
      (currency) => !(currency in balances) && (balances[currency] = 0),
    )
  }

  private initializeBalancesObject(createAccountDto: CreateAccountDto) {
    createAccountDto.balances = {}
    createAccountDto.currencies.forEach(
      (currency) => (createAccountDto.balances![currency] = 0),
    )
  }

  private updateBalancesForNewCurrencies(
    existingAccount: IAccount,
    newCurrencies: SupportedCurrency[],
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
}
