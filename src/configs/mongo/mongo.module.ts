import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { ConfigService } from '@nestjs/config'
import { MongoService } from './mongo.service'

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new MongoService(configService).getConfig(),
    }),
  ],
})
export class MongoDatabaseModule {}
