export enum Events {
  AccountCreated = 'AccountCreated',
  TransactionCreated = 'TransactionCreated',
  AccountUpdated = 'AccountUpdated',
}

export interface IAccountCreated {
  id: string
  customerId: string
  currencies: string[]
  balances: Map<string, number>
  createdAt: Date
}

export interface IAccountUpdated extends IAccountCreated {
  updatedAt: Date
}

export interface ITransactionCreated {
  id: string
  accountId: string
  amount: number
  currency: string
  type: 'INBOUND' | 'OUTBOUND'
  date: Date
}
