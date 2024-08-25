import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export const validationMiddleware = <T extends object>(
  dtoClass: new () => T,
  handler: (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>
) => {
  return async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const dtoObject = plainToClass(dtoClass, JSON.parse(event.body || '{}'));

    const errors = await validate(dtoObject);
    if (errors.length > 0) {
      const formattedErrors = errors.map(error => ({
        property: error.property,
        constraints: error.constraints,
      }));

      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Validation failed',
          errors: formattedErrors,
        }),
      };
    } else {
      return handler(event);
    }
  };
};
