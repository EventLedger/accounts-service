import { FilterQuery, Model } from 'mongoose'

import { AccountsService } from './accountsService'
import { ITransaction, Transaction } from '../models/transaction'
import { BadRequestException } from '../utils/exceptions'
import { CreateTransactionDto, ListTransactionsDto } from '../dto/transaction'
import { SupportedCurrency } from '../constants/currencies'
// import { AwsEventBridgeService } from './awsEventBridgeService';

export class TransactionsService {
  private transactionModel: Model<ITransaction>
  private accountsService: AccountsService
  // private eventBridgeService: AwsEventBridgeService;

  constructor(accountsService: AccountsService) {
    this.transactionModel = Transaction
    this.accountsService = accountsService
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<ITransaction> {
    const transaction = new this.transactionModel(createTransactionDto)
    const account = await this.accountsService.getAccount(
      createTransactionDto.accountId,
    )

    this.ensureCurrencySupported(
      account.currencies,
      createTransactionDto.currency,
    )

    if (createTransactionDto.type === 'INBOUND') {
      account.balances.set(
        createTransactionDto.currency,
        (account.balances.get(createTransactionDto.currency) || 0) +
          createTransactionDto.amount,
      )
    } else if (createTransactionDto.type === 'OUTBOUND') {
      this.ensureSufficientBalance(
        account.balances.get(createTransactionDto.currency) || 0,
        createTransactionDto,
      )

      account.balances.set(
        createTransactionDto.currency,
        (account.balances.get(createTransactionDto.currency) || 0) -
          createTransactionDto.amount,
      )
    }

    await account.save()
    await transaction.save()

    // Optionally publish event to EventBridge
    // this.eventBridgeService.publishEvent('TransactionCreated', transaction);

    return transaction
  }

  async getTransactions({
    accountId,
    limit,
    skip,
    from,
    to,
  }: ListTransactionsDto): Promise<{
    transactions: ITransaction[]
    total: number
  }> {
    const account = await this.accountsService.getAccount(
      accountId,
    )
    const filter = {
      accountId: account.id,
      ...this.createDateFilter(from, to),
    }
    console.log({filter})
    let query = this.transactionModel.find(filter)

    if (limit && limit > 0) {
      query = query.limit(limit)
    }
    if (skip && skip > 0) {
      query = query.skip(skip)
    }

    const transactions = await query.exec()
    const total = await this.transactionModel
      .countDocuments({ accountId })
      .exec()

    return { transactions, total }
  }

  private ensureCurrencySupported(
    supportedCurrencies: SupportedCurrency[],
    currency: SupportedCurrency,
  ): void {
    if (!supportedCurrencies.includes(currency)) {
      throw new BadRequestException(
        `Currency ${currency} is not supported by this account.`,
      )
    }
  }

  private ensureSufficientBalance(
    accountCurrencyBalance: number,
    { currency, amount }: CreateTransactionDto,
  ): void {
    if (accountCurrencyBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance: Account has ${accountCurrencyBalance} ${currency}, but the transaction requires ${amount} ${currency}.`,
      )
    }
  }

  private createDateFilter(
    from?: Date,
    to?: Date,
  ): FilterQuery<ITransaction['date']> {
    const dateFilter: FilterQuery<ITransaction['date']> = {};
  
    if (from) dateFilter['date'] = { ...dateFilter['date'], $gte: from };
    if (to) dateFilter['date'] = { ...dateFilter['date'], $lte: to };
  
    return dateFilter;
  }  
}
