import { validateOrReject } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { BadRequestException } from './exceptions'

export async function validateDto<T extends object>(
  dtoClass: new () => T,
  plainObject: object,
): Promise<void> {
  const dtoInstance = plainToClass(dtoClass, plainObject)

  try {
    await validateOrReject(dtoInstance)
  } catch (errors) {
    if (Array.isArray(errors)) {
      const formattedErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }))

      throw new BadRequestException(
        JSON.stringify({
          message: 'Validation failed',
          errors: formattedErrors,
        }),
      )
    }

    throw new BadRequestException('Unexpected validation error occurred')
  }
}
