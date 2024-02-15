import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-custom'
import { Request } from 'express'
import { REFRESH_TOKEN_COOKIE_NAME } from '../../auth'
import { JwtService } from '../../configs'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy) {
  constructor(private jwtService: JwtService) {
    super()
  }

  public async validate(req: Request) {
    const token = this._extractRefreshTokenFromHeader(req)

    if (!token) {
      throw new UnauthorizedException()
    }

    try {
      const payload = this.jwtService.getJwtDataByToken(token)

      const { userId, deviceId } = payload

      return {
        userId,
        deviceId,
      }
    } catch {
      throw new UnauthorizedException()
    }
  }

  private _extractRefreshTokenFromHeader(req: Request) {
    return req.cookies[REFRESH_TOKEN_COOKIE_NAME]
  }
}
