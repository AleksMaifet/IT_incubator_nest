import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { UserModel, UserSchema, UserPgEntity } from './models'
import { CustomUserValidationByEmail, CustomUserValidationByLogin } from './dto'
import { UsersRepository, UsersSqlRepository } from './repositories'
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
    TypeOrmModule.forFeature([UserPgEntity]),
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
