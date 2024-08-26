import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { validateDto } from '../utils/validateDto'
import { ListTransactionsDto } from '../dto/transaction'
import { connectToDatabase } from '../utils/connectToDB'
import { AccountsService } from '../services/accountsService'
import { TransactionsService } from '../services/transactionsService'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connectToDatabase()
  const accountsService = new AccountsService()
  const transactionsService = new TransactionsService(accountsService)

  const accountId = event.pathParameters?.accountId
  const { limit, skip, to, from } = event.queryStringParameters
  const queryParams: ListTransactionsDto = {
    accountId,
    limit: parseInt(limit, 10),
    skip: parseInt(skip, 10),
    to: to ? new Date(to) : undefined,
    from: from ? new Date(from) : undefined,
  }

  try {
    await validateDto(ListTransactionsDto, queryParams)
    const transactions = await transactionsService.getTransactions(queryParams)
    return {
      statusCode: 200,
      body: JSON.stringify(transactions),
    }
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: error.message }),
    }
  }
}
