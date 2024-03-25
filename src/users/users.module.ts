import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CqrsModule } from '@nestjs/cqrs'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UserModel, UserSchema } from './user.model'
import { CustomUserValidationByEmail, CustomUserValidationByLogin } from './dto'
import { UsersRepository, UsersSqlRepository } from './repositories'
import {
  CreateUserUseCase,
  DeleteUserByIdUseCase,
  GetAllUsersUseCase,
} from './useCases'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModelEntity } from '../configs/postgres/entities'

const useCases = [CreateUserUseCase, GetAllUsersUseCase, DeleteUserByIdUseCase]

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
      },
    ]),
    TypeOrmModule.forFeature([UserModelEntity]),
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
