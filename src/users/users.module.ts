import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UserModel, UserSchema } from './user.model'
import { UsersRepository } from './users.repository'
import { CustomUserValidationByEmail, CustomUserValidationByLogin } from './dto'

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
    UsersService,
    UsersRepository,
    CustomUserValidationByLogin,
    CustomUserValidationByEmail,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
