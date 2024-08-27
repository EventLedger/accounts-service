import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { connectToDatabase } from '../utils/connectToDB'
import { TransactionsService } from '../services/transactionsService'
import { AccountsService } from '../services/accountsService'
import { CreateTransactionDto } from '../dto/transaction'
import { validationMiddleware } from '../utils/validationMiddleware'
import { withErrorHandling } from '../utils/withErrorHandling'

const createTransactionHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  await connectToDatabase()

  const accountsService = new AccountsService()
  const transactionsService = new TransactionsService(accountsService)

  const createTransactionDto: CreateTransactionDto = JSON.parse(
    event.body || '{}',
  )

  const transaction =
    await transactionsService.createTransaction(createTransactionDto)
  return {
    statusCode: 201,
    body: JSON.stringify(transaction),
  }
}

export const handler = validationMiddleware(
  CreateTransactionDto,
  async (event) => withErrorHandling(() => createTransactionHandler(event))(),
)
