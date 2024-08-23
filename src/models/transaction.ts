import { Schema, Document, model, Types } from 'mongoose';

import { TransactionType, TransactionTypeMap } from '../constants/transactionType';

export interface ITransaction extends Document {
  accountId: Types.ObjectId;
  type: TransactionType;
  currency: string;
  amount: number;
  date: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: Object.values(TransactionTypeMap), required: true },
  currency: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export const Transaction = model<ITransaction>('Transaction', TransactionSchema);
