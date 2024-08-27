import { Schema, Document, model, Model } from 'mongoose'

import { SupportedCurrency } from '../constants/currencies'

export interface IAccount extends Document {
  customerId: string
  accountNumber: string
  currencies: SupportedCurrency[]
  balances: Map<string, number>
}

const AccountSchema = new Schema<IAccount>(
  {
    customerId: { type: String, required: true, unique: true },
    accountNumber: { type: String, required: true, unique: true },
    currencies: { type: [String], required: true },
    balances: { type: Map, of: Number, default: {} },
  },
  {
    timestamps: true,
  },
)

export const Account: Model<IAccount> = model<IAccount>(
  'Account',
  AccountSchema,
)
