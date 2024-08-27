import mongoose from 'mongoose'

import { Account } from '../../src/models/account'
import { Transaction } from '../../src/models/transaction'
import { connectToDatabase } from '../../src/utils/connectToDB'
import { handler as getTransactionsHandler } from '../../src/handlers/getTransactions'

jest.mock('../../src/utils/connectToDB')

describe('getTransactionsHandler', () => {
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

  it('should return transactions for a valid account', async () => {
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
    })
    const transaction2 = new Transaction({
      accountId: account._id,
      type: 'OUTBOUND',
      currency: 'USD',
      amount: 50,
    })
    await transaction1.save()
    await transaction2.save()

    const event = {
      pathParameters: { accountId: account._id.toString() },
    } as any

    const result = await getTransactionsHandler(event)

    expect(result.statusCode).toBe(200)
    const body = JSON.parse(result.body)

    expect(body.transactions.length).toBe(2)
    expect(body.total).toBe(2)
    expect(body.transactions[0].amount).toBe(100)
    expect(body.transactions[1].amount).toBe(50)
  })

  it('should return 404 if the account is not found', async () => {
    const nonExistentId = new mongoose.Types.ObjectId()

    const event = {
      pathParameters: { accountId: nonExistentId.toString() },
    } as any

    const result = await getTransactionsHandler(event)
    const body = JSON.parse(result.body)

    expect(result.statusCode).toBe(404)
    expect(body.message).toBe(`Account with ID ${nonExistentId} not found`)
  })
})
