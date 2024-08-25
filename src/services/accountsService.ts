import { Model } from 'mongoose';

import { Account, IAccount } from '../models/account';
import { CreateAccountDto, UpdateAccountDto } from '../dto/account';
// import { AwsEventBridgeService } from './awsEventBridgeService';
import { validateCurrenciesInBalance, initializeBalancesObject, updateBalancesForNewCurrencies } from '../utils/balanceUtils';
import { NotFoundException } from '../utils/exceptions';

export class AccountsService {
  private accountModel: Model<IAccount>;
  // private readonly eventBridgeService: AwsEventBridgeService;

  constructor() {
    this.accountModel = Account; // Inject the model correctly
    // this.eventBridgeService = new AwsEventBridgeService(); // Initialize the EventBridge service
  }

  async createAccount(createAccountDto: CreateAccountDto): Promise<IAccount> {
    if (createAccountDto.balances) {
      validateCurrenciesInBalance(createAccountDto.balances, createAccountDto.currencies);
    } else {
      initializeBalancesObject(createAccountDto);
    }

    const newAccount = new this.accountModel(createAccountDto);
    await newAccount.save();

    // this.eventBridgeService.publishEvent('AccountCreated', newAccount);
    return newAccount;
  }

  async getAccount(accountId: string): Promise<IAccount> {
    const account = await this.accountModel.findById(accountId).exec();

    if (!account) {
      throw new NotFoundException(`Account with ID ${accountId} not found`);
    }
    return account;
  }

  async updateAccount(accountId: string, updateAccountDto: UpdateAccountDto): Promise<IAccount> {
    const account = await this.getAccount(accountId);

    if (updateAccountDto.currencies) {
      updateBalancesForNewCurrencies(account, updateAccountDto.currencies);
    }

    if (updateAccountDto.balances) {
      validateCurrenciesInBalance(updateAccountDto.balances, updateAccountDto.currencies || account.currencies);
    }

    Object.assign(account, updateAccountDto);
    const updatedAccount = await account.save();

    // this.eventBridgeService.publishEvent('AccountUpdated', updatedAccount);
    return updatedAccount;
  }
}
