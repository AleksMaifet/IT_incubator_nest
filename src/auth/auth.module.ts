import { Logger, Module } from '@nestjs/common'
import { ThrottlerModule } from '@nestjs/throttler'
import { MongooseModule } from '@nestjs/mongoose'
import { CqrsModule } from '@nestjs/cqrs'
import { UserModel, UserSchema, UsersModule } from '../users'
import { ManagerEmail } from '../managers'
import { AdapterEmail } from '../adapters'
import { JwtService } from '../configs'
import { RefreshTokenStrategy } from '../libs/strategies'
import { SecurityDevicesModule } from '../security-devices/security-devices.module'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfirmationModel, ConfirmationSchema } from './confirmation.model'
import { AuthRepository } from './auth.repository'
import {
  CustomRegEmailValidation,
  CustomUpdatedPassValidationByRecoveryCode,
  CustomUserValidationByEmail,
  CustomUserValidationByLogin,
} from './dto'
import { AuthSqlRepository } from './auth.sql.repository'
import {
  ConfirmEmailUseCase,
  CreateUserUseCase,
  LoginUserUseCase,
  PasswordRecoveryUseCase,
  RegistrationEmailResendingUseCase,
  UpdateUserPasswordUseCase,
} from './useCases'

const useCases = [
  CreateUserUseCase,
  LoginUserUseCase,
  UpdateUserPasswordUseCase,
  PasswordRecoveryUseCase,
  ConfirmEmailUseCase,
  RegistrationEmailResendingUseCase,
]

@Module({
  imports: [
    CqrsModule,
    UsersModule,
    SecurityDevicesModule,
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
    AuthSqlRepository,
    ManagerEmail,
    AdapterEmail,
    Logger,
    JwtService,
    RefreshTokenStrategy,
    CustomUserValidationByLogin,
    CustomUserValidationByEmail,
    CustomUpdatedPassValidationByRecoveryCode,
    CustomRegEmailValidation,
    ...useCases,
  ],
})
export class AuthModule {}
