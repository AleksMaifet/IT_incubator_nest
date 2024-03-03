import { Injectable, Logger } from '@nestjs/common'
import { IUser, UsersRepository, UsersSqlRepository } from '../users'
import { ManagerEmail } from '../managers'
import { AuthRepository } from './auth.repository'
import { AuthSqlRepository } from './auth.sql.repository'

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly authSqlRepository: AuthSqlRepository,
    private readonly usersRepository: UsersRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly managerEmail: ManagerEmail,
    private readonly loggerService: Logger,
  ) {}

  public async sendEmailConfirmationCode(
    user: Pick<IUser, 'id' | 'login' | 'email'> & { code: string },
  ) {
    const { id, login, email, code } = user

    try {
      const info = await this.managerEmail.sendUserEmailConfirmationCode({
        login,
        email,
        code,
      })

      this.loggerService.log('Message sent ' + info.response)
      return true
    } catch (error) {
      this.loggerService.error(`NodeMailer ${error}`)

      await this.usersSqlRepository.deleteById(id)
      await this.authSqlRepository.deleteConfirmationByCodeORUserId(id)
      return null
    }
  }
}
