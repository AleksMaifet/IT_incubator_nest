import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common'
import cookieParser from 'cookie-parser'
import { useContainer } from 'class-validator'
import { AppModule } from './app.module'
import { IErrorResponse } from './libs/interfaces'

export const appSettings = (app: INestApplication) => {
  app.use(cookieParser())

  useContainer(app.select(AppModule), { fallbackOnErrors: true })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      exceptionFactory: (errors) => {
        const errorResponse: IErrorResponse = {
          errorsMessages: [],
        }

        errors.forEach(({ constraints, property }) => {
          errorResponse.errorsMessages.push({
            message: Object.values(constraints || {}).join(', '),
            field: property,
          })
        })

        throw new BadRequestException(errorResponse)
      },
    }),
  )
  app.enableCors()
}
