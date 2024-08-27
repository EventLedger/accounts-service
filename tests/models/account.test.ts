import mongoose from 'mongoose'

import { connectToDatabase } from '../../src/utils/connectToDB'
import { Account, IAccount } from '../../src/models/account'
import { SupportedCurrency } from '../../src/constants/currencies'

jest.mock('../../src/utils/connectToDB')

describe('Account Model Test Suite', () => {
  beforeAll(async () => {
    await connectToDatabase()
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  afterEach(async () => {
    const collections = mongoose.connection.collections
    for (const key in collections) {
      const collection = collections[key]
      await collection.deleteMany({})
    }
  })

  it('should create and save a new account successfully', async () => {
    const validAccountData: Partial<IAccount> = {
      customerId: 'customerId123',
      accountNumber: '1234567890',
      currencies: ['USD', 'EUR'] as SupportedCurrency[],
      balances: new Map([
        ['USD', 100],
        ['EUR', 50],
      ]),
    }

    const account = new Account(validAccountData)
    const savedAccount = await account.save()

    expect(savedAccount._id).toBeDefined()
    expect(savedAccount.customerId).toBe(validAccountData.customerId)
    expect(savedAccount.accountNumber).toBe(validAccountData.accountNumber)
    expect(savedAccount.currencies).toEqual(
      expect.arrayContaining(['USD', 'EUR']),
    )
    expect(savedAccount.balances.get('USD')).toBe(100)
    expect(savedAccount.balances.get('EUR')).toBe(50)
  })

  it('should fail to create account without required fields', async () => {
    const invalidAccountData: Partial<IAccount> = {
      currencies: ['USD', 'EUR'] as SupportedCurrency[],
    }

    const account = new Account(invalidAccountData)

    let error
    try {
      await account.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.name).toBe('ValidationError')
    expect(error.errors.customerId).toBeDefined()
    expect(error.errors.accountNumber).toBeDefined()
  })

  it('should enforce unique customerId and accountNumber', async () => {
    const accountData1: Partial<IAccount> = {
      customerId: 'customerId123',
      accountNumber: '1234567890',
      currencies: ['USD'] as SupportedCurrency[],
    }
    const accountData2: Partial<IAccount> = {
      customerId: 'customerId123', // Duplicate customerId
      accountNumber: '1234567891', // Different accountNumber
      currencies: ['EUR'] as SupportedCurrency[],
    }

    const account1 = new Account(accountData1)
    await account1.save()

    const account2 = new Account(accountData2)
    let error
    try {
      await account2.save()
    } catch (err) {
      error = err
    }

    expect(error).toBeDefined()
    expect(error.name).toBe('MongoServerError')
    expect(error.code).toBe(11000) // Duplicate key error code
  })

  it('should default balances to an empty map', async () => {
    const accountData: Partial<IAccount> = {
      customerId: 'customerId123',
      accountNumber: '1234567890',
      currencies: ['USD'] as SupportedCurrency[],
    }

    const account = new Account(accountData)
    const savedAccount = await account.save()

    expect(savedAccount.balances).toBeInstanceOf(Map)
    expect(savedAccount.balances.size).toBe(0)
  })
})
