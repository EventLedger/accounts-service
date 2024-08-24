import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { CreateAccountDto } from '../dto/account.dto';
import { connectToDatabase } from '../utils/connectToDB';
import { AccountsService } from '../services/accounts.service';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await connectToDatabase();
  const accountsService = new AccountsService();
  const createAccountDto: CreateAccountDto = JSON.parse(event.body || '{}');

  try {
    const account = await accountsService.createAccount(createAccountDto);
    return {
      statusCode: 201,
      body: JSON.stringify(account),
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
