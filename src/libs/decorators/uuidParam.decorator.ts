import { NotFoundException, Param, ParseUUIDPipe } from '@nestjs/common'

export const UUIDParam = (property: string) =>
  Param(
    property,
    new ParseUUIDPipe({
      exceptionFactory: (errors) => {
        throw new NotFoundException({
          message: errors,
          field: property,
        })
      },
    }),
  )
