import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { connectToDatabase } from '../utils/connectToDB'
import { AccountsService } from '../services/accountsService'
import { withErrorHandling } from '../utils/withErrorHandling'

const getAccountHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  await connectToDatabase()
  const accountsService = new AccountsService()
  const accountId = event.pathParameters?.accountId

  const account = await accountsService.getAccount(accountId)
  return {
    statusCode: 200,
    body: JSON.stringify(account),
  }
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> =>
  withErrorHandling(() => getAccountHandler(event))();