import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { CommandBus } from '@nestjs/cqrs'
import { Response } from 'express'
import { parse } from 'useragent'
import { JwtService } from '../configs'
import {
  AuthPassRecoveryDto,
  AuthRegConfirmCodeDto,
  AuthRegEmailDto,
  AuthRegNewUserDto,
  AuthUpdatePassDto,
  BaseAuthDto,
} from './dto'
import { REFRESH_TOKEN_COOKIE_NAME } from './constants'
import { User } from '../libs/decorators'
import {
  JwtAuthGuard,
  JwtRefreshGuard,
  ThrottlerBehindProxyGuard,
} from '../libs/guards'
import { IJwtUser } from '../libs/interfaces'
import {
  CreateRefreshTokenMetaCommand,
  DeleteRefreshTokenMetaCommand,
  GetRefreshTokenMetaCommand,
  UpdateRefreshTokenMetaCommand,
} from '../security-devices'
import {
  ConfirmEmailCommand,
  CreateUserCommand,
  LoginUserCommand,
  PasswordRecoveryCommand,
  RegistrationEmailResendingCommand,
  UpdateUserPasswordCommand,
} from './useCases'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly commandBus: CommandBus,
  ) {}

  private async _isCurrentRefreshTokenExist(
    payload: Pick<IJwtUser, 'userId' | 'deviceId' | 'iat' | 'exp'>,
  ) {
    const { userId, deviceId, iat, exp } = payload

    return await this.commandBus.execute(
      new GetRefreshTokenMetaCommand({
        userId,
        deviceId,
        issuedAt: iat,
        expirationAt: exp,
      }),
    )
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  private async login(
    @Headers('user-agent') userAgent: string,
    @Ip() ip: string,
    @Body() body: BaseAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.commandBus.execute(new LoginUserCommand(body))

    if (!userId) {
      throw new UnauthorizedException()
    }

    const accessJwtToken = this.jwtService.generateAccessToken(userId)
    const refreshJwtToken = this.jwtService.generateRefreshToken(userId)
    const payload = this.jwtService.getJwtDataByToken(refreshJwtToken)

    const { deviceId, iat, exp } = payload

    await this.commandBus.execute(
      new CreateRefreshTokenMetaCommand({
        userId,
        deviceId,
        issuedAt: iat,
        expirationAt: exp,
        deviceName: parse(userAgent!).family,
        clientIp: ip!,
      }),
    )

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshJwtToken, {
      httpOnly: true,
      secure: true,
    })

    return {
      accessToken: accessJwtToken,
    }
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async passwordRecovery(@Body() body: AuthPassRecoveryDto) {
    const { email } = body

    await this.commandBus.execute(new PasswordRecoveryCommand(email))
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updatePassword(@Body() body: AuthUpdatePassDto) {
    await this.commandBus.execute(new UpdateUserPasswordCommand(body))
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  private async getMe(@User() user: IJwtUser) {
    return user
  }

  @UseGuards(JwtRefreshGuard)
  @Post('/refresh-token')
  @HttpCode(HttpStatus.OK)
  private async getNewPairAuthTokens(
    @User() user: IJwtUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, deviceId } = user

    const result = await this._isCurrentRefreshTokenExist(user)

    if (!result) {
      throw new UnauthorizedException()
    }

    const accessJwtToken = this.jwtService.generateAccessToken(userId)
    const refreshJwtToken = this.jwtService.updateRefreshToken(userId, deviceId)
    const payload = this.jwtService.getJwtDataByToken(refreshJwtToken)

    const { userId: currentUserId, iat, exp } = payload

    await this.commandBus.execute(
      new UpdateRefreshTokenMetaCommand({
        userId: currentUserId,
        deviceId,
        issuedAt: iat,
        expirationAt: exp,
      }),
    )

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshJwtToken, {
      httpOnly: true,
      secure: true,
    })

    return {
      accessToken: accessJwtToken,
    }
  }

  @UseGuards(JwtRefreshGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async logout(
    @User() user: IJwtUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { userId, deviceId } = user

    const result = await this._isCurrentRefreshTokenExist(user)

    if (!result) {
      throw new UnauthorizedException()
    }

    await this.commandBus.execute(
      new DeleteRefreshTokenMetaCommand({
        userId,
        deviceId,
      }),
    )

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME)
  }

  @Throttle({ default: { limit: 5, ttl: 14000 } })
  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async registration(@Body() body: AuthRegNewUserDto) {
    const result = await this.commandBus.execute(new CreateUserCommand(body))

    if (!result) {
      throw new BadRequestException()
    }
  }

  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async registrationConfirmation(@Body() body: AuthRegConfirmCodeDto) {
    const { code } = body

    await this.commandBus.execute(new ConfirmEmailCommand(code))
  }

  @Throttle({ default: { limit: 5, ttl: 15000 } })
  @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async registrationEmailResending(@Body() body: AuthRegEmailDto) {
    const { email } = body

    await this.commandBus.execute(new RegistrationEmailResendingCommand(email))
  }
}
