import mongoose from 'mongoose'

import { Account } from '../../src/models/account'
import { connectToDatabase } from '../../src/utils/connectToDB'
import { handler as updateAccountHandler } from '../../src/handlers/updateAccount'

jest.mock('../../src/utils/connectToDB')
jest.mock('aws-sdk', () => {
  const EventBridge = {
    putEvents: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({}),
  }
  return { EventBridge: jest.fn(() => EventBridge) }
})

describe('updateAccountHandler', () => {
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

  it('should update and return the account when valid data is provided', async () => {
    const account = new Account({
      customerId: 'customerId123',
      accountNumber: '1234567890',
      currencies: ['USD'],
      balances: { USD: 100 },
    })
    await account.save()

    const event = {
      pathParameters: { accountId: account.id },
      body: JSON.stringify({
        currencies: ['USD', 'EUR'],
      }),
    } as any

    const result = await updateAccountHandler(event)
    const body = JSON.parse(result.body)

    expect(body.currencies).toContain('EUR')
    expect(result.statusCode).toBe(200)
    expect(body.balances?.EUR).toBe(0)
  })

  it('should return 404 when the account to update is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId()

    const event = {
      pathParameters: { accountId: nonExistentId },
      body: JSON.stringify({
        currencies: ['USD', 'EUR'],
      }),
    } as any

    const result = await updateAccountHandler(event)
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(404)
    expect(body.message).toBe(`Account with ID ${nonExistentId} not found`)
  })
})
