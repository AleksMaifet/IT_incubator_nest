import { ConfigService } from '@nestjs/config'
import {
  BlogPgEntity,
  CommentLikePgEntity,
  CommentPgEntity,
  ConfirmationModelPgEntity,
  PostLikePgEntity,
  PostPgEntity,
  RefreshTokenMetaPgEntity,
  UserModelEntity,
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
        UserModelEntity,
        ConfirmationModelPgEntity,
        RefreshTokenMetaPgEntity,
        BlogPgEntity,
        PostPgEntity,
        PostLikePgEntity,
        CommentPgEntity,
        CommentLikePgEntity,
      ],
      synchronize: true,
    }
  }
}

export { PostgresService }
