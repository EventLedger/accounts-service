import mongoose from 'mongoose'

import { Account } from '../../src/models/account'
import { Transaction } from '../../src/models/transaction'
import { BadRequestException } from '../../src/utils/exceptions'
import { AccountsService } from '../../src/services/accountsService'
import { TransactionsService } from '../../src/services/transactionsService'
import {
  CreateTransactionDto,
  ListTransactionsDto,
} from '../../src/dto/transaction'

jest.mock('../../src/services/accountsService')
jest.mock('aws-sdk', () => {
  const EventBridge = {
    putEvents: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({}),
  }
  return { EventBridge: jest.fn(() => EventBridge) }
})

describe('TransactionsService', () => {
  let transactionsService: TransactionsService
  let accountsService: AccountsService

  beforeAll(async () => {
    accountsService = new AccountsService()
    transactionsService = new TransactionsService()
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
    jest.clearAllMocks()
  })

  describe('createTransaction', () => {
    it('should create a transaction and update account balance for INBOUND', async () => {
      const account = new Account({
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
        balances: new Map([['USD', 100]]),
      })
      await account.save()

      jest.spyOn(accountsService, 'getAccount').mockResolvedValue(account)

      const createTransactionDto: CreateTransactionDto = {
        accountId: account._id.toString(),
        type: 'INBOUND',
        amount: 50,
        currency: 'USD',
      }

      const transaction =
        await transactionsService.createTransaction(createTransactionDto)
      const updatedAccount = await Account.findById(account._id)

      expect(transaction).toBeDefined()
      expect(transaction.amount).toBe(50)
      expect(transaction.currency).toBe('USD')
      expect(updatedAccount?.balances.get('USD')).toBe(150)
    })

    it('should create a transaction and update account balance for OUTBOUND', async () => {
      const account = new Account({
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
        balances: new Map([['USD', 100]]),
      })
      await account.save()

      jest.spyOn(accountsService, 'getAccount').mockResolvedValue(account)

      const createTransactionDto: CreateTransactionDto = {
        accountId: account._id.toString(),
        type: 'OUTBOUND',
        amount: 50,
        currency: 'USD',
      }

      const transaction =
        await transactionsService.createTransaction(createTransactionDto)

      const updatedAccount = await Account.findById(account._id)

      expect(transaction).toBeDefined()
      expect(transaction.amount).toBe(50)
      expect(transaction.currency).toBe('USD')
      expect(updatedAccount?.balances.get('USD')).toBe(50)
    })

    it('should throw a BadRequestException for insufficient balance', async () => {
      const account = new Account({
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
        balances: new Map([['USD', 20]]),
      })
      await account.save()

      jest.spyOn(accountsService, 'getAccount').mockResolvedValue(account)

      const createTransactionDto: CreateTransactionDto = {
        accountId: account._id.toString(),
        type: 'OUTBOUND',
        amount: 50,
        currency: 'USD',
      }

      await expect(
        transactionsService.createTransaction(createTransactionDto),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw a BadRequestException for unsupported currency', async () => {
      const account = new Account({
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
        balances: new Map([['USD', 100]]),
      })
      await account.save()

      jest.spyOn(accountsService, 'getAccount').mockResolvedValue(account)

      const createTransactionDto: CreateTransactionDto = {
        accountId: account._id.toString(),
        type: 'INBOUND',
        amount: 50,
        currency: 'EUR',
      }

      await expect(
        transactionsService.createTransaction(createTransactionDto),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('getTransactions', () => {
    it('should return transactions with correct filtering', async () => {
      const account = new Account({
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
        balances: new Map([['USD', 100]]),
      })
      await account.save()

      const transaction1 = new Transaction({
        accountId: account._id,
        type: 'INBOUND',
        currency: 'USD',
        amount: 100,
        date: new Date('2024-01-01'),
      })
      const transaction2 = new Transaction({
        accountId: account._id,
        type: 'OUTBOUND',
        currency: 'USD',
        amount: 50,
        date: new Date('2024-01-02'),
      })
      const transaction3 = new Transaction({
        accountId: account._id,
        type: 'OUTBOUND',
        currency: 'USD',
        amount: 50,
        date: new Date('2023-01-02'),
      })

      await transaction1.save()
      await transaction2.save()
      await transaction3.save()

      jest.spyOn(accountsService, 'getAccount').mockResolvedValue(account)
      const listTransactionsDto: ListTransactionsDto = {
        accountId: account._id.toString(),
        from: new Date('2024-01-01'),
        to: new Date('2024-01-02'),
      }

      const { transactions, total } =
        await transactionsService.getTransactions(listTransactionsDto)

      expect(transactions.length).toBe(2)
      expect(total).toBe(3)
      expect(transactions[0].amount).toBe(100)
      expect(transactions[1].amount).toBe(50)
    })
  })
})
