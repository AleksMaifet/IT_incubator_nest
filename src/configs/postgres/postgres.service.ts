import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface'

class PostgresService {
  constructor(private readonly configService: ConfigService) {}

  public async getConfig(): Promise<TypeOrmModuleOptions> {
    return {
      type: 'postgres',
      host: this.configService.get('POSTGRES_DB_HOST'),
      port: this.configService.get('POSTGRES_DB_PORT'),
      username: this.configService.get('POSTGRES_DB_USER'),
      password: this.configService.get('POSTGRES_DB_PASSWORD'),
      database: this.configService.get('POSTGRES_DB_NAME'),
      autoLoadEntities: true,
      synchronize: true,
      ssl: this.configService.get('POSTGRES_SSL') === 'true',
    }
  }
}

export { PostgresService }
