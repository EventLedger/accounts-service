import mongoose from 'mongoose'

import { Account } from '../../src/models/account'
import { connectToDatabase } from '../../src/utils/connectToDB'
import { handler as getAccountHandler } from '../../src/handlers/getAccount'

jest.mock('../../src/utils/connectToDB')

describe('getAccountHandler', () => {
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

  it('should return the account when found', async () => {
    const account = new Account({
      customerId: 'customerId123',
      accountNumber: '1234567890',
      currencies: ['USD'],
      balances: { USD: 100 },
    })
    const abc = await account.save()

    const event = {
      pathParameters: { accountId: account.id },
    } as any

    const result = await getAccountHandler(event)
    const body = JSON.parse(result.body)
    
    expect(result.statusCode).toBe(200)
    expect(body.customerId).toBe('customerId123')
    expect(body.accountNumber).toBe('1234567890')
  })

  it('should return 404 when account is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId()

    const event = {
      pathParameters: { accountId: nonExistentId },
    } as any

    const result = await getAccountHandler(event)

    expect(result.statusCode).toBe(404)
    const body = JSON.parse(result.body)
    expect(body.message).toBe(`Account with ID ${nonExistentId} not found`)
  })
})
