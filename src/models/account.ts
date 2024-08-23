import { Schema, Document, model } from 'mongoose';

import { SUPPORTED_CURRENCIES, SupportedCurrency } from '../constants/currencies';

interface IAccount extends Document {
  customerId: string;
  accountNumber: string;
  currencies: SupportedCurrency[];
  balances: { [currency: string]: number };
}

const AccountSchema = new Schema<IAccount>({
  customerId: { type: String, required: true, unique: true },
  accountNumber: { type: String, required: true, unique: true },
  currencies: { 
    type: [{ type: String, enum: SUPPORTED_CURRENCIES }], 
    required: true, 
    default: [SUPPORTED_CURRENCIES[0]] 
  },
  balances: { type: Map, of: Number, default: {} }
});

export const Account = model<IAccount>('Account', AccountSchema);
