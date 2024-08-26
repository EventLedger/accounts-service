import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { connectToDatabase } from '../utils/connectToDB'
import { AccountsService } from '../services/accountsService'
import { UpdateAccountDto } from '../dto/account'
import { validationMiddleware } from '../utils/validationMiddleware'

const updateAccountHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connectToDatabase()

  const accountsService = new AccountsService()
  const accountId = event.pathParameters?.accountId
  const updateAccountDto: UpdateAccountDto = JSON.parse(event.body || '{}')

  try {
    const updatedAccount = await accountsService.updateAccount(accountId!, updateAccountDto)
    return {
      statusCode: 200,
      body: JSON.stringify(updatedAccount),
    }
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({
        message: error.message || 'Internal Server Error',
      }),
    }
  }
}

export const handler = validationMiddleware(UpdateAccountDto, updateAccountHandler)