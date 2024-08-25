import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateAccountDto } from '../dto/account'
import { connectToDatabase } from '../utils/connectToDB'
import { AccountsService } from '../services/accountsService'
import { validationMiddleware } from '../utils/validationMiddleware'

const createAccountHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  await connectToDatabase()
  const accountsService = new AccountsService()

  try {
    const createAccountDto: CreateAccountDto = JSON.parse(event.body || '{}')
    const account = await accountsService.createAccount(createAccountDto)

    return {
      statusCode: 201,
      body: JSON.stringify(account),
    }
  } catch (error) {
    return {
      statusCode: error.code || 500,
      body: JSON.stringify({ message: error.message }),
    }
  }
}

export const handler = validationMiddleware(CreateAccountDto, createAccountHandler)
