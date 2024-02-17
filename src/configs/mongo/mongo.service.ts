import { ConfigService } from '@nestjs/config'

class MongoService {
  private readonly dbName: string

  constructor(private readonly configService: ConfigService) {
    const NODE_ENV = this.configService.get('NODE_ENV')
    this.dbName = this._getNameDB(NODE_ENV)
  }

  private _getNameDB(env: string) {
    switch (true) {
      case env === 'test':
        return this.configService.get('MONGO_DB_NAME_TEST')
      default:
        return this.configService.get('MONGO_DB_NAME')
    }
  }

  public async getMongoConfig() {
    return {
      uri: this.configService.get('MONGO_DB_URL'),
      dbName: this.dbName,
    }
  }
}

export { MongoService }
