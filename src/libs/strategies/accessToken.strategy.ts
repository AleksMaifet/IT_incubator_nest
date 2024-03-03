import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersRepository, UsersSqlRepository } from '../../users'

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }

  public async validate(payload: any) {
    const { userId } = payload

    const user = await this.usersSqlRepository.getById(userId)

    return {
      userId,
      login: user?.login,
      email: user?.email,
    }
  }
}
