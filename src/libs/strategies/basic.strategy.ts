import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { BasicStrategy as Strategy } from 'passport-http'
import { Request } from 'express'

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      passReqToCallback: true,
    })
  }

  public async validate(req: Request, login: string, password: string) {
    const [type, _] = req.headers.authorization?.split(' ') ?? []

    if (type !== 'Basic') {
      throw new UnauthorizedException()
    }

    if (
      login !== this.configService.get('BASIC_LOGIN') ||
      password !== this.configService.get('BASIC_PASSWORD')
    ) {
      throw new UnauthorizedException()
    }
    return true
  }
}
