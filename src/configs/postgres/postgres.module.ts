import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigService } from '@nestjs/config'
import { PostgresService } from './postgres.service'

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new PostgresService(configService).getConfig(),
    }),
  ],
})
export class PostgresDatabaseModule {}
