import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { validateDto } from '../utils/validateDto'
import { ListTransactionsDto } from '../dto/transaction'
import { connectToDatabase } from '../utils/connectToDB'
import { TransactionsService } from '../services/transactionsService'
import { withErrorHandling } from '../utils/withErrorHandling'

function sanitizeParamsFromQueryString(
  queryString: APIGatewayProxyEvent['queryStringParameters'] = {},
): Partial<ListTransactionsDto> {
  return {
    limit: queryString.limit ? parseInt(queryString.limit, 10) : undefined,
    skip: queryString.skip ? parseInt(queryString.skip, 10) : undefined,
    to: queryString.to ? new Date(queryString.to) : undefined,
    from: queryString.from ? new Date(queryString.from) : undefined,
  }
}

const getTransactionsHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  await connectToDatabase()
  const transactionsService = new TransactionsService()
  
  const queryStringParams = event.queryStringParameters
    ? sanitizeParamsFromQueryString(event.queryStringParameters)
    : {}
  const queryParams = {
    accountId: event.pathParameters?.accountId,
    ...queryStringParams,
  }
  
  await withErrorHandling(() => validateDto(ListTransactionsDto, queryParams))()
  const transactions = await transactionsService.getTransactions(
    queryParams as ListTransactionsDto,
  )
  return {
    statusCode: 200,
    body: JSON.stringify(transactions),
  }
}

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> =>
  withErrorHandling(() => getTransactionsHandler(event))()
