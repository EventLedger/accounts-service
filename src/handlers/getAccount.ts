import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { connectToDatabase } from '../utils/connectToDB';
import { AccountsService } from '../services/accountsService';

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  await connectToDatabase();
  const accountsService = new AccountsService();
  const accountId = event.pathParameters?.accountId;

  try {
    const account = await accountsService.getAccount(accountId!);
    return {
      statusCode: 200,
      body: JSON.stringify(account),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
