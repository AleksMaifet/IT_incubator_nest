import { Inject, Injectable } from '@nestjs/common'
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'
import { UsersRepository } from '../../../users'

@ValidatorConstraint({ async: true })
@Injectable()
class IsUserNotExist implements ValidatorConstraintInterface {
  constructor(
    @Inject('UsersRepository')
    private readonly usersRepository: UsersRepository,
  ) {}

  async validate(loginOrEmail: string) {
    const user = await this.usersRepository.getByLoginOrEmail(loginOrEmail)

    return !user
  }
}

export { IsUserNotExist }
