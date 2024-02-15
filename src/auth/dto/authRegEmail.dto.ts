import { Injectable } from '@nestjs/common'
import {
  IsNotEmpty,
  IsString,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { UsersRepository } from '../../users'
import { AuthRepository } from '../auth.repository'

@ValidatorConstraint({ async: true })
@Injectable()
class CustomRegEmailValidation implements ValidatorConstraintInterface {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async validate(email: string) {
    const user = await this.usersRepository.getByLoginOrEmail(email)

    if (!user) return false

    const { id } = user

    const confirmation =
      await this.authRepository.getEmailConfirmationByCodeOrUserId(id)

    return !!confirmation
  }

  defaultMessage() {
    return 'email already confirmed or user email doesnt exist'
  }
}

class AuthRegEmailDto {
  @IsNotEmpty()
  @IsString()
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, {
    message: 'email must be a valid',
  })
  @Validate(CustomRegEmailValidation)
  readonly email: string
}

export { AuthRegEmailDto, CustomRegEmailValidation }
