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
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { AuthService } from './auth.service'
import {
  AuthPassRecoveryDto,
  AuthRegConfirmCodeDto,
  AuthRegEmailDto,
  AuthUpdatePassDto,
  BaseAuthDto,
} from './dto'
import { JwtService } from '../configs'
import { REFRESH_TOKEN_COOKIE_NAME } from './constants'
import {
  JwtAuthGuard,
  JwtRefreshGuard,
  // ThrottlerBehindProxyGuard,
} from '../libs/guards'
import { AuthRegNewUserDto } from './dto'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}

  // @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  private async login(
    @Headers() headers: any,
    @Ip() ip: string,
    @Body() body: BaseAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = await this.authService.login(body)

    if (!userId) {
      throw new UnauthorizedException()
    }

    const accessJwtToken = this.jwtService.generateAccessToken(userId)
    const refreshJwtToken = this.jwtService.generateRefreshToken(userId)
    const payload = this.jwtService.getJwtDataByToken(refreshJwtToken)

    const { deviceId, iat, exp } = payload

    // await this.securityDevicesService.createRefreshTokenMeta({
    //   userId,
    //   deviceId,
    //   issuedAt: iat,
    //   expirationAt: exp,
    //   deviceName: parse(headers['user-agent']!).family,
    //   clientIp: ip!,
    // })

    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshJwtToken, {
      httpOnly: true,
      secure: true,
    })

    return {
      accessToken: accessJwtToken,
    }
  }

  // @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async passwordRecovery(@Body() body: AuthPassRecoveryDto) {
    const { email } = body

    await this.authService.passwordRecovery(email)
  }

  // @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updatePassword(@Body() body: AuthUpdatePassDto) {
    await this.authService.updateUserPassword(body)
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  private async getMe(@Request() req: any) {
    return req.user
  }

  @Post('/refresh-token')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  private async getNewPairAuthTokens(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const {
      user: { id, deviceId },
    } = req

    const accessJwtToken = this.jwtService.generateAccessToken(id)
    const refreshJwtToken = this.jwtService.updateRefreshToken(id, deviceId)
    const payload = this.jwtService.getJwtDataByToken(refreshJwtToken)

    const { userId, iat, exp } = payload
    // await this.securityDevicesService.updateRefreshTokenMeta({
    //   userId,
    //   deviceId,
    //   issuedAt: iat,
    //   expirationAt: exp,
    // })
    res.cookie(REFRESH_TOKEN_COOKIE_NAME, refreshJwtToken, {
      httpOnly: true,
      secure: true,
    })

    return {
      accessToken: accessJwtToken,
    }
  }

  @Post('/logout')
  private async logout(
    @Request() req: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const {
      context: {
        user: { id },
        token: { deviceId },
      },
    } = req

    // await this.securityDevicesService.deleteRefreshTokenMeta({
    //   userId: id,
    //   deviceId,
    // })

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME)
  }

  // @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async registration(@Body() body: AuthRegNewUserDto) {
    const result = await this.authService.registration(body)

    if (!result) {
      throw new BadRequestException()
    }
  }

  // @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async registrationConfirmation(@Body() body: AuthRegConfirmCodeDto) {
    const { code } = body

    await this.authService.confirmEmail(code)
  }

  // @UseGuards(ThrottlerBehindProxyGuard)
  @Post('/registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async registrationEmailResending(@Body() body: AuthRegEmailDto) {
    const { email } = body

    await this.authService.registrationEmailResending(email)
  }
}
