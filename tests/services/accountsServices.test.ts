import mongoose from 'mongoose'

import { Account } from '../../src/models/account'
import { AccountsService } from '../../src/services/accountsService'
import { CreateAccountDto, UpdateAccountDto } from '../../src/dto/account'
import {
  BadRequestException,
  NotFoundException,
} from '../../src/utils/exceptions'

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
        balances: { USD: 100 },
      }

      const result = await accountsService.createAccount(createAccountDto)
      const accountInDb = await Account.findById(result.id)

      expect(accountInDb).not.toBeNull()
      expect(result.customerId).toEqual(createAccountDto.customerId)
      expect(result.accountNumber).toEqual(createAccountDto.accountNumber)
      expect(result.currencies).toEqual(createAccountDto.currencies)
      expect(result.balances.get('USD')).toEqual(createAccountDto.balances?.USD)
    })

    it('should throw a BadRequestException for unsupported currency in balances', async () => {
      const createAccountDto: CreateAccountDto = {
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
        balances: { ABC: 123 },
      }

      await expect(
        accountsService.createAccount(createAccountDto),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw a BadRequestException for invalid balances', async () => {
      const createAccountDto: CreateAccountDto = {
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
        balances: { USD: -123 },
      }

      await expect(
        accountsService.createAccount(createAccountDto),
      ).rejects.toThrow(BadRequestException)
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
        balances: { USD: 200, EUR: 50 },
      }

      const updatedAccount = await accountsService.updateAccount(
        account.id,
        updateAccountDto,
      )

      expect(updatedAccount.currencies).toContain('EUR')
      expect(updatedAccount.balances.get('EUR')).toEqual(50)
      expect(updatedAccount.balances.get('USD')).toEqual(200)
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

    it('should throw a BadRequestException for invalid currency in balances', async () => {
      const nonExistentId = new mongoose.Types.ObjectId()
      const updateAccountDto: UpdateAccountDto = {
        balances: { CNY: 124 },
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
