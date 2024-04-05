import { ConfigService } from '@nestjs/config'
import {
  BlogPgEntity,
  CommentLikePgEntity,
  CommentPgEntity,
  ConfirmationPgEntity,
  PostLikePgEntity,
  PostPgEntity,
  RefreshTokenMetaPgEntity,
  UserPgEntity,
} from './entities'

class PostgresService {
  constructor(private readonly configService: ConfigService) {}

  public async getConfig() {
    return {
      type: this.configService.get('POSTGRES_DB_TYPE'),
      host: this.configService.get('POSTGRES_DB_HOST'),
      port: this.configService.get('POSTGRES_DB_PORT'),
      username: this.configService.get('POSTGRES_DB_USER'),
      password: this.configService.get('POSTGRES_DB_PASSWORD'),
      database: this.configService.get('POSTGRES_DB_NAME'),
      entities: [
        UserPgEntity,
        ConfirmationPgEntity,
        RefreshTokenMetaPgEntity,
        BlogPgEntity,
        PostPgEntity,
        PostLikePgEntity,
        CommentPgEntity,
        CommentLikePgEntity,
      ],
      synchronize: true,
      ssl: this.configService.get('POSTGRES_SSL') === 'true',
    }
  }
}

export { PostgresService }
