import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CqrsModule } from '@nestjs/cqrs'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UserModel, UserSchema } from './user.model'
import { UsersRepository } from './users.repository'
import { CustomUserValidationByEmail, CustomUserValidationByLogin } from './dto'
import { UsersSqlRepository } from './users.sql.repository'
import {
  CreateUserUseCase,
  DeleteUserByIdUseCase,
  GetAllUsersUseCase,
} from './useCases'

const useCases = [CreateUserUseCase, GetAllUsersUseCase, DeleteUserByIdUseCase]

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
      },
    ]),
    CqrsModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersSqlRepository,
    CustomUserValidationByLogin,
    CustomUserValidationByEmail,
    ...useCases,
  ],
  exports: [UsersService, UsersRepository, UsersSqlRepository],
})
export class UsersModule {}
