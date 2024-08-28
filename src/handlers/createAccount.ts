import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { CreateAccountDto } from '../dto/account'
import { connectToDatabase } from '../utils/connectToDB'
import { AccountsService } from '../services/accountsService'
import { validationMiddleware } from '../utils/validationMiddleware'
import { withErrorHandling } from '../utils/withErrorHandling'

const createAccountHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  await connectToDatabase()
  const accountsService = new AccountsService()

  const createAccountDto: CreateAccountDto = JSON.parse(event.body || '{}')
  const account = await accountsService.createAccount(createAccountDto)
  
  return {
    statusCode: 201,
    body: JSON.stringify(account),
  }
}

export const handler = validationMiddleware(CreateAccountDto, async (event) =>
  withErrorHandling(() => createAccountHandler(event))(),
)
