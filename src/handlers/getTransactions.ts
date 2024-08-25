import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { connectToDatabase } from '../utils/connectToDB'
import { TransactionsService } from '../services/transactionsService'
import { AccountsService } from '../services/accountsService'
// import { AwsEventBridgeService } from '../services/awsEventBridgeService';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connectToDatabase()

  const accountsService = new AccountsService()
  // const eventBridgeService = new AwsEventBridgeService();
  const transactionsService = new TransactionsService(accountsService)

  const accountId = event.pathParameters?.accountId

  try {
    const transactions = await transactionsService.getTransactions(accountId!)
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
