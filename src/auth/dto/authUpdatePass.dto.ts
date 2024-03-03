import { Injectable } from '@nestjs/common'
import {
  IsNotEmpty,
  IsString,
  Length,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from '../constants'
import { AuthRepository } from '../auth.repository'
import { AuthSqlRepository } from '../auth.sql.repository'

@ValidatorConstraint({ async: true })
@Injectable()
class CustomUpdatedPassValidationByRecoveryCode
  implements ValidatorConstraintInterface
{
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authSqlRepository: AuthSqlRepository,
  ) {}

  async validate(code: string) {
    const confirmation =
      await this.authSqlRepository.getConfirmationByCodeOrUserId(code)

    switch (true) {
      case !confirmation:
        return false
      case confirmation!.expiresIn < new Date():
        return false
      case confirmation!.isConfirmed:
        return false
      default:
        return true
    }
  }

  defaultMessage() {
    return 'invalid code'
  }
}

class AuthUpdatePassDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH)
  readonly newPassword: string

  @IsNotEmpty()
  @IsString()
  @Validate(CustomUpdatedPassValidationByRecoveryCode)
  readonly recoveryCode: string
}

export { AuthUpdatePassDto, CustomUpdatedPassValidationByRecoveryCode }
