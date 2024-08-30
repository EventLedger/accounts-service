import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { connectToDatabase } from '../utils/connectToDB'
import { AccountsService } from '../services/accountsService'
import { UpdateAccountDto } from '../dto/account'
import { validationMiddleware } from '../utils/validationMiddleware'
import { withErrorHandling } from '../utils/withErrorHandling'

const updateAccountHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  await connectToDatabase()

  const accountsService = new AccountsService()
  const accountId = event.pathParameters?.accountId
  const { customerId, accountNumber, currencies }: UpdateAccountDto =
    JSON.parse(event.body || '{}')

  const updatedAccount = await accountsService.updateAccount(accountId!, {
    customerId,
    accountNumber,
    currencies,
  })
  return {
    statusCode: 200,
    body: JSON.stringify(updatedAccount),
  }
}

export const handler = validationMiddleware(UpdateAccountDto, async (event) =>
  withErrorHandling(() => updateAccountHandler(event))(),
)
