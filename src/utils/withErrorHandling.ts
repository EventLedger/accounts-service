import { APIGatewayProxyResult } from 'aws-lambda'

function isErrorWithStatusCode(error: unknown): error is {
  code: number
  statusCode: number
  message: string
  name: string
  keyValue: string
} {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('statusCode' in error || 'code' in error) &&
    ('message' in error || 'keyValue' in error || 'reason' in error)
  )
}

function handleError(error: unknown): APIGatewayProxyResult {
  if (isErrorWithStatusCode(error)) {
    if (error.name === 'MongoServerError') {
      if (error.code === 11000) {
        return {
          statusCode: 409,
          body: JSON.stringify({
            message: 'Duplicate key error',
            errors: [error.keyValue],
          }),
        }
      } else {
        return {
          statusCode: 500,
          body: JSON.stringify({
            message: 'Unhandled mongoose error',
            errors: [error.keyValue],
          }),
        }
      }
    }
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({ message: error.message }),
    }
  }

  return {
    statusCode: 500,
    body: JSON.stringify({
      message: 'An unexpected error occurred',
      error: error,
    }),
  }
}

export function withErrorHandling<T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<APIGatewayProxyResult | T> {
  return async (...args: Args): Promise<APIGatewayProxyResult | T> => {
    try {
      return await fn(...args)
    } catch (error) {
      return handleError(error)
    }
  }
}
