import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { APP_GUARD } from '@nestjs/core'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UserModel, UserSchema } from './user.model'
import { UsersRepository } from './users.repository'
import { CustomUserValidationByEmail, CustomUserValidationByLogin } from './dto'
import { BasicAuthGuard } from '../libs/guards'
import { BasicStrategy } from '../libs/strategies'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: BasicAuthGuard,
    },
    UsersService,
    UsersRepository,
    BasicStrategy,
    CustomUserValidationByLogin,
    CustomUserValidationByEmail,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
