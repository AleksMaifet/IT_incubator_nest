import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common'
import { validate, ValidationError } from 'class-validator'
import { plainToInstance } from 'class-transformer'
import { IErrorResponse } from './interfaces'

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value
    }

    const object = plainToInstance(metatype, value)
    const errors = await validate(object)

    if (errors.length > 0) {
      throw new BadRequestException(this.createErrorResponse(errors))
    }

    return value
  }

  private toValidate(metaType: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object]
    return !types.includes(metaType)
  }

  private createErrorResponse(errors: ValidationError[]) {
    const errorResponse: IErrorResponse = {
      errorsMessages: [],
    }

    errors.forEach(({ constraints, property }) => {
      errorResponse.errorsMessages.push({
        message: Object.values(constraints || {}).join(', '),
        field: property,
      })
    })

    return errorResponse
  }
}
