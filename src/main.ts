import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { appSettings } from './app.settings'

async function bootstrap() {
  const logger = new Logger()

  const app = await NestFactory.create(AppModule)

  appSettings(app)

  const config = app.get<ConfigService>(ConfigService)

  const port = config.get('PORT')
  await app.listen(port)

  logger.log(`App listening on port ${port}`)
}

bootstrap()
