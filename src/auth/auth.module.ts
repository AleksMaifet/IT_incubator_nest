import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfirmationModel, ConfirmationSchema } from './confirmation.model'
import { AuthRepository } from './auth.repository'
import { UserModel, UserSchema, UsersModule } from '../users'
import { ManagerEmail } from '../managers'
import { AdapterEmail } from '../adapters'
import { JwtService } from '../configs'
import {
  CustomRegEmailValidation,
  CustomUpdatedPassValidationByRecoveryCode,
  CustomUserValidationByEmail,
  CustomUserValidationByLogin,
} from './dto'
import { AccessTokenStrategy, RefreshTokenStrategy } from '../libs/strategies'
import { ThrottlerModule } from '@nestjs/throttler'

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      {
        name: ConfirmationModel.name,
        schema: ConfirmationSchema,
      },
      {
        name: UserModel.name,
        schema: UserSchema,
      },
    ]),
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    ManagerEmail,
    AdapterEmail,
    Logger,
    JwtService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    CustomUserValidationByLogin,
    CustomUserValidationByEmail,
    CustomUpdatedPassValidationByRecoveryCode,
    CustomRegEmailValidation,
  ],
})
export class AuthModule {}
