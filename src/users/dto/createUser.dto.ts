import { Injectable } from '@nestjs/common'
import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { Transform } from 'class-transformer'
import {
  MAX_LOGIN_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_LOGIN_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../constants'
import { UsersRepository, UsersSqlRepository } from '../repositories'

@ValidatorConstraint({ async: true })
@Injectable()
class CustomUserValidationByEmail implements ValidatorConstraintInterface {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {}

  async validate(loginOrEmail: string) {
    const user = await this.usersSqlRepository.getByLoginOrEmail(loginOrEmail)

    return !user
  }

  defaultMessage() {
    return 'user with this email exists'
  }
}

@ValidatorConstraint({ async: true })
@Injectable()
class CustomUserValidationByLogin implements ValidatorConstraintInterface {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {}

  async validate(loginOrEmail: string) {
    const user = await this.usersSqlRepository.getByLoginOrEmail(loginOrEmail)

    return !user
  }

  defaultMessage() {
    return 'user with this login exists'
  }
}

class CreateUserDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(MIN_LOGIN_LENGTH, MAX_LOGIN_LENGTH)
  @Matches(/^[a-zA-Z0-9_-]*$/, {
    message: 'login must be a valid',
  })
  @Validate(CustomUserValidationByLogin)
  readonly login: string

  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH)
  readonly password: string

  @IsNotEmpty()
  @IsString()
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'email must be a valid',
  })
  @Validate(CustomUserValidationByEmail)
  readonly email: string
}

export {
  CreateUserDto,
  CustomUserValidationByLogin,
  CustomUserValidationByEmail,
}
