import { Model } from 'mongoose';

import { AccountsService } from './accountsService';
import { ITransaction, Transaction } from '../models/transaction';
import { BadRequestException } from '../utils/exceptions';
import { CreateTransactionDto } from '../dto/transaction';
import { SupportedCurrency } from '../constants/currencies';
// import { AwsEventBridgeService } from './awsEventBridgeService';

export class TransactionsService {
  private transactionModel: Model<ITransaction>;
  private accountsService: AccountsService;
  // private eventBridgeService: AwsEventBridgeService;

  constructor(
    accountsService: AccountsService,
  ) {
    this.transactionModel = Transaction;
    this.accountsService = accountsService;
  }

  async createTransaction(
    createTransactionDto: CreateTransactionDto,
  ): Promise<ITransaction> {
    const transaction = new this.transactionModel(createTransactionDto);
    const account = await this.accountsService.getAccount(
      createTransactionDto.accountId,
    );

    this.ensureCurrencySupported(
      account.currencies,
      createTransactionDto.currency,
    );

    if (createTransactionDto.type === 'INBOUND') {
      account.balances.set(
        createTransactionDto.currency,
        (account.balances.get(createTransactionDto.currency) || 0) +
          createTransactionDto.amount,
      );
    } else if (createTransactionDto.type === 'OUTBOUND') {
      this.ensureSufficientBalance(
        account.balances.get(createTransactionDto.currency) || 0,
        createTransactionDto,
      );

      account.balances.set(
        createTransactionDto.currency,
        (account.balances.get(createTransactionDto.currency) || 0) -
          createTransactionDto.amount,
      );
    }

    await account.save();
    await transaction.save();

    // Optionally publish event to EventBridge
    // this.eventBridgeService.publishEvent('TransactionCreated', transaction);

    return transaction;
  }

  async getTransactions(accountId: string): Promise<ITransaction[]> {
    return this.transactionModel.find({ accountId }).exec();
  }

  private ensureCurrencySupported(
    supportedCurrencies: SupportedCurrency[],
    currency: SupportedCurrency,
  ): void {
    if (!supportedCurrencies.includes(currency)) {
      throw new BadRequestException(
        `Currency ${currency} is not supported by this account.`,
      );
    }
  }

  private ensureSufficientBalance(
    accountCurrencyBalance: number,
    { currency, amount }: CreateTransactionDto,
  ): void {
    if (accountCurrencyBalance < amount) {
      throw new BadRequestException(
        `Insufficient balance: Account has ${accountCurrencyBalance} ${currency}, but the transaction requires ${amount} ${currency}.`,
      );
    }
  }
}
