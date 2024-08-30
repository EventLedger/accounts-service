import mongoose from 'mongoose'

import { Account } from '../../src/models/account'
import { connectToDatabase } from '../../src/utils/connectToDB'
import { handler as createTransactionHandler } from '../../src/handlers/createTransaction'

jest.mock('../../src/utils/connectToDB')
jest.mock('aws-sdk', () => {
  const EventBridge = {
    putEvents: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({}),
  }
  return { EventBridge: jest.fn(() => EventBridge) }
})

describe('createTransactionHandler', () => {
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

  it('should create a transaction and return 201 status', async () => {
    const account = new Account({
      customerId: 'customerId123',
      accountNumber: '1234567890',
      currencies: ['USD'],
      balances: new Map([['USD', 100]]),
    })
    await account.save()

    const event = {
      body: JSON.stringify({
        accountId: account._id.toString(),
        type: 'INBOUND',
        amount: 50,
        currency: 'USD',
      }),
    } as any

    const result = await createTransactionHandler(event)
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(201)
    expect(body.amount).toBe(50)
    expect(body.currency).toBe('USD')
  })

  it('should return 400 status for validation errors', async () => {
    const event = {
      body: JSON.stringify({
        type: 'INBOUND',
        amount: -50,
        currency: 'USD',
      }),
    } as any

    const result = await createTransactionHandler(event)
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(400)
    expect(body.message).toBe('Validation Error')
  })

  it('should return 404 if the account is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId()

    const event = {
      body: JSON.stringify({
        accountId: nonExistentId.toString(),
        type: 'INBOUND',
        amount: 50,
        currency: 'USD',
      }),
    } as any

    const result = await createTransactionHandler(event)
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(404)
    expect(body.message).toBe(`Account with ID ${nonExistentId} not found`)
  })
})
