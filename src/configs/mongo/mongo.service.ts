import { ConfigService } from '@nestjs/config'

class MongoService {
  constructor(private readonly configService: ConfigService) {}

  public async getConfig() {
    return {
      uri: this.configService.get('MONGO_DB_URL'),
      dbName: this.configService.get('MONGO_DB_NAME'),
    }
  }
}

export { MongoService }
