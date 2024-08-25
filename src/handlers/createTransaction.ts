import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { connectToDatabase } from '../utils/connectToDB'
import { TransactionsService } from '../services/transactionsService'
import { AccountsService } from '../services/accountsService'
// import { AwsEventBridgeService } from '../services/awsEventBridgeService';
import { CreateTransactionDto } from '../dto/transaction'

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connectToDatabase()

  const accountsService = new AccountsService()
  const transactionsService = new TransactionsService(accountsService)

  const createTransactionDto: CreateTransactionDto = JSON.parse(event.body || '{}')

  try {
    const transaction = await transactionsService.createTransaction(createTransactionDto)
    return {
      statusCode: 201,
      body: JSON.stringify(transaction),
    }
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: error.message }),
    }
  }
}
