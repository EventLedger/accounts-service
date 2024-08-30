import mongoose from 'mongoose'

import { Account } from '../../src/models/account'
import { AccountsService } from '../../src/services/accountsService'
import { CreateAccountDto, UpdateAccountDto } from '../../src/dto/account'
import { NotFoundException } from '../../src/utils/exceptions'

jest.mock('aws-sdk', () => {
  const EventBridge = {
    putEvents: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({}),
  }
  return { EventBridge: jest.fn(() => EventBridge) }
})

describe('AccountsService', () => {
  let accountsService: AccountsService

  beforeEach(() => {
    accountsService = new AccountsService()
  })

  describe('createAccount', () => {
    it('should create and return a new account', async () => {
      const createAccountDto: CreateAccountDto = {
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
      }

      const result = await accountsService.createAccount(createAccountDto)
      const accountInDb = await Account.findById(result.id)

      expect(accountInDb).not.toBeNull()
      expect(result.customerId).toEqual(createAccountDto.customerId)
      expect(result.accountNumber).toEqual(createAccountDto.accountNumber)
      expect(result.currencies).toEqual(createAccountDto.currencies)
    })
  })

  describe('getAccount', () => {
    it('should return the account when found', async () => {
      const account = new Account({
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
        balances: { USD: 100 },
      })
      await account.save()

      const foundAccount = await accountsService.getAccount(account.id)

      expect(foundAccount).not.toBeNull()
      expect(foundAccount.customerId).toEqual(account.customerId)
    })

    it('should throw a NotFoundException if the account is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId()

      await expect(
        accountsService.getAccount(nonExistentId.toHexString()),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateAccount', () => {
    it('should update and return the account with new data', async () => {
      const account = new Account({
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
        balances: { USD: 100 },
      })
      await account.save()

      const updateAccountDto: UpdateAccountDto = {
        currencies: ['USD', 'EUR'],
      }

      const updatedAccount = await accountsService.updateAccount(
        account.id,
        updateAccountDto,
      )

      expect(updatedAccount.currencies).toContain('EUR')
      expect(updatedAccount.balances.get('EUR')).toEqual(0)
      expect(updatedAccount.balances.get('USD')).toEqual(100)
    })

    it('should throw a NotFoundException if the account to update is not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId()
      const updateAccountDto: UpdateAccountDto = {
        currencies: ['USD', 'EUR'],
      }

      await expect(
        accountsService.updateAccount(
          nonExistentId.toHexString(),
          updateAccountDto,
        ),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
