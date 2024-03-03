import { Injectable } from '@nestjs/common'
import { genSalt, hash } from 'bcrypt'
import { DEFAULTS } from './constants'

const { SALT_ROUNDS } = DEFAULTS

@Injectable()
export class UsersService {
  public async generateSalt() {
    return await genSalt(SALT_ROUNDS)
  }

  public async generateHash(password: string, passwordSalt: string) {
    return await hash(password, passwordSalt)
  }
}
