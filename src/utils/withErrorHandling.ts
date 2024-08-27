import { APIGatewayProxyResult } from 'aws-lambda'

function isErrorWithCode(error: unknown): error is { code: number; message: string } {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error
}

function handleError(error: unknown): APIGatewayProxyResult {
  console.log({error})
  if (isErrorWithCode(error)) {
    return {
      statusCode: error.code,
      body: JSON.stringify({ message: error.message }),
    }
  }

  return {
    statusCode: 500,
    body: JSON.stringify({ message: 'An unexpected error occurred' }),
  }
}

export function withErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>
): (...args: Args) => Promise<APIGatewayProxyResult | T> {
  return async (...args: Args): Promise<APIGatewayProxyResult | T> => {
    try {
      return await fn(...args);
    } catch (error) {
      return handleError(error);
    }
  };
}
