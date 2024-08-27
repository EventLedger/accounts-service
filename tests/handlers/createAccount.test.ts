import mongoose from 'mongoose'

import { connectToDatabase } from '../../src/utils/connectToDB'
import { handler as createAccountHandler } from '../../src/handlers/createAccount'

jest.mock('../../src/utils/connectToDB')

describe('createAccountHandler', () => {
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

  it('should create a new account and return 201 status', async () => {
    const event = {
      body: JSON.stringify({
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
      }),
    } as any

    const result = await createAccountHandler(event)
    const account = JSON.parse(result.body)

    expect(result.statusCode).toBe(201)
    expect(account.customerId).toBe('customerId123')
    expect(account.accountNumber).toBe('1234567890')
    expect(account.currencies).toContain('USD')
  })

  it('should return 400 status when validation fails', async () => {
    const event = {
      body: JSON.stringify({
        accountNumber: '1234567890',
        currencies: ['USD'],
      }),
    } as any

    const result = await createAccountHandler(event)
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(400)
    expect(body.message).toBe('Validation failed')
  })

  it('should return 409 status when duplicate account is created', async () => {
    const event = {
      body: JSON.stringify({
        customerId: 'customerId123',
        accountNumber: '1234567890',
        currencies: ['USD'],
      }),
    } as any

    await createAccountHandler(event)
    const result = await createAccountHandler(event)

    expect(result.statusCode).toBe(409)
    const body = JSON.parse(result.body)
    expect(body.message).toBe('Duplicate key error')
  })
})
