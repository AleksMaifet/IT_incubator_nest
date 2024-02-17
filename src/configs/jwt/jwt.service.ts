import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { sign, verify } from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
class JwtService {
  private readonly _secretOrPrivateKey: string

  constructor(
    private readonly configService: ConfigService,
    private readonly loggerService: Logger,
  ) {
    this._secretOrPrivateKey = this.configService.get('JWT_SECRET')
  }

  public generateAccessToken(userId: string) {
    return sign({ userId }, this._secretOrPrivateKey, {
      expiresIn: '30m',
    })
  }

  public generateRefreshToken(userId: string) {
    return sign({ userId, deviceId: uuidv4() }, this._secretOrPrivateKey, {
      expiresIn: '1h',
    })
  }

  public updateRefreshToken(userId: string, deviceId: string) {
    return sign({ userId, deviceId }, this._secretOrPrivateKey, {
      expiresIn: '1h',
    })
  }

  public getJwtDataByToken(token: string): Nullable<any> {
    try {
      return verify(token, this._secretOrPrivateKey)
    } catch (error) {
      this.loggerService.error(`${error} ${token}`)
      return null
    }
  }
}

export { JwtService }
