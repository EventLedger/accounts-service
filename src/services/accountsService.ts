import { Model } from 'mongoose'

import { Events } from '../constants/events'
import { Account, IAccount } from '../models/account'
import { CreateAccountDto, UpdateAccountDto } from '../dto/account'
import { NotFoundException } from '../utils/exceptions'
import { SupportedCurrency } from '../constants/currencies'
import { AwsEventBridgeService } from './awsEventBridgeService'

export class AccountsService {
  private accountModel: Model<IAccount>
  private eventBridgeService: AwsEventBridgeService

  constructor() {
    this.accountModel = Account
    this.eventBridgeService = new AwsEventBridgeService()
  }

  async createAccount(createAccountDto: CreateAccountDto): Promise<IAccount> {
    this.initializeBalancesObject(createAccountDto)

    const newAccount = new this.accountModel(createAccountDto)
    await newAccount.save()

    const { id, customerId, currencies, balances } = newAccount
    await this.eventBridgeService.publishEvent(Events.AccountCreated, {
      id,
      customerId,
      currencies,
      balances,
      date: new Date(),
    })

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

    Object.assign(account, updateAccountDto)
    const updatedAccount = await account.save()

    const { id, customerId, currencies, balances } = updatedAccount
    await this.eventBridgeService.publishEvent(Events.AccountUpdated, {
      id,
      customerId,
      currencies,
      balances,
      date: new Date(),
    })

    return updatedAccount
  }

  private initializeBalancesObject(createAccountDto: CreateAccountDto) {
    const balances: IAccount['balances'] = new Map()
    createAccountDto.currencies.forEach((currency) => (balances[currency] = 0))
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
