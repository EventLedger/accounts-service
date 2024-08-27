import mongoose from 'mongoose'

import { Transaction, ITransaction } from '../../src/models/transaction'
import { Account, IAccount } from '../../src/models/account'
import { connectToDatabase } from '../../src/utils/connectToDB'
import {
  TransactionType,
  TransactionTypeMap,
} from '../../src/constants/transactionType'

jest.mock('../../src/utils/connectToDB')

describe('Transaction Model Test Suite', () => {
  beforeAll(async () => {
    await connectToDatabase()
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  let account: IAccount

  beforeEach(async () => {
    account = new Account({
      customerId: 'customerId123',
      accountNumber: '1234567890',
      currencies: ['USD'],
      balances: new Map([['USD', 100]]),
    })
    await account.save()
  })

  it('should create and save a new transaction successfully', async () => {
    const validTransactionData: Partial<ITransaction> = {
      accountId: account.id,
      type: TransactionTypeMap.INBOUND,
      currency: 'USD',
      amount: 50,
    }

    const transaction = new Transaction(validTransactionData)
    const savedTransaction = await transaction.save()

    expect(savedTransaction._id).toBeDefined()
    expect(savedTransaction.accountId).toEqual(account._id)
    expect(savedTransaction.type).toBe(TransactionTypeMap.INBOUND)
    expect(savedTransaction.currency).toBe('USD')
    expect(savedTransaction.amount).toBe(50)
    expect(savedTransaction.date).toBeDefined()
  })

  it('should fail to create a transaction without required fields', async () => {
    const invalidTransactionData: Partial<ITransaction> = {
      currency: 'USD',
      amount: 50,
    }

    const transaction = new Transaction(invalidTransactionData)

    let error
    try {
      await transaction.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.name).toBe('ValidationError')
    expect(error.errors.accountId).toBeDefined()
    expect(error.errors.type).toBeDefined()
  })

  it('should fail to create a transaction with an invalid type', async () => {
    const invalidTransactionData: Partial<ITransaction> = {
      accountId: account.id,
      type: 'INVALID_TYPE' as TransactionType, // Invalid transaction type
      currency: 'USD',
      amount: 50,
    }

    const transaction = new Transaction(invalidTransactionData)

    let error
    try {
      await transaction.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.name).toBe('ValidationError')
    expect(error.errors.type).toBeDefined()
    expect(error.errors.type.message).toContain(
      '`INVALID_TYPE` is not a valid enum value',
    )
  })

  it('should default the date to the current date', async () => {
    const transactionData: Partial<ITransaction> = {
      accountId: account.id,
      type: TransactionTypeMap.OUTBOUND,
      currency: 'USD',
      amount: 25,
    }

    const transaction = new Transaction(transactionData)
    const savedTransaction = await transaction.save()

    expect(savedTransaction.date).toBeDefined()
    const now = new Date()
    const transactionDate = new Date(savedTransaction.date)
    expect(transactionDate.getDate()).toBe(now.getDate())
    expect(transactionDate.getMonth()).toBe(now.getMonth())
    expect(transactionDate.getFullYear()).toBe(now.getFullYear())
  })

  it('should reference the correct account', async () => {
    const transactionData: Partial<ITransaction> = {
      accountId: account.id,
      type: TransactionTypeMap.OUTBOUND,
      currency: 'USD',
      amount: 25,
    }

    const transaction = new Transaction(transactionData)
    const savedTransaction = await transaction.save()

    const fetchedTransaction = await Transaction.findById(
      savedTransaction._id,
    ).populate('accountId')

    expect(fetchedTransaction).toBeDefined()
    expect(fetchedTransaction!.accountId._id).toEqual(account._id)
    expect(fetchedTransaction!.accountId['customerId']).toBe('customerId123')
  })
})
