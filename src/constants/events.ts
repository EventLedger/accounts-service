import { TransactionType } from "./transactionType";

export enum Events {
  AccountCreated = 'AccountCreated',
  TransactionCreated = 'TransactionCreated',
  AccountUpdated = 'AccountUpdated',
}

export interface TransactionEvent {
  id: string;
  accountId: string;
  currency: string;
  amount: number;
  type: TransactionType;
  date: Date;
}

export interface AccountEvent {
  id: string
  customerId: string
  currencies: string[]
  balances: Map<string, number>
  date: Date
}
