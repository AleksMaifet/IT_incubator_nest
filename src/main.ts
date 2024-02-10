import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { useContainer } from 'class-validator'
import { AppModule } from './app.module'
import { ValidationPipe } from './libs/pipes'

async function bootstrap() {
  const logger = new Logger()

  const app = await NestFactory.create(AppModule)

  useContainer(app.select(AppModule), { fallbackOnErrors: true })
  app.useGlobalPipes(new ValidationPipe())

  const config = app.get<ConfigService>(ConfigService)

  const port = config.get('PORT')
  await app.listen(port)

  logger.log(`App listening on port ${port}`)
}

bootstrap()
