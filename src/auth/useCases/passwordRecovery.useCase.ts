import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Logger } from '@nestjs/common'
import { UsersSqlRepository } from '../../users'
import { AuthSqlRepository } from '../repositories'
import { PasswordRecoveryConfirmationEntity } from '../entities'
import { ManagerEmail } from '../../managers'

class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
class PasswordRecoveryUseCase
  implements ICommandHandler<PasswordRecoveryCommand>
{
  constructor(
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly authSqlRepository: AuthSqlRepository,
    private readonly managerEmail: ManagerEmail,
    private readonly loggerService: Logger,
  ) {}

  async execute(command: PasswordRecoveryCommand) {
    const { email } = command

    const user = await this.usersSqlRepository.getByLoginOrEmail(email)

    if (!user) return false

    const { id, login } = user

    const newPasswordRecoveryConfirmation =
      new PasswordRecoveryConfirmationEntity(id)
    const { code } = newPasswordRecoveryConfirmation

    await this.authSqlRepository.passwordRecoveryConfirmation(
      newPasswordRecoveryConfirmation,
    )

    try {
      const info = await this.managerEmail.sendPasswordRecoveryConfirmationCode(
        {
          login,
          email,
          code,
        },
      )

      this.loggerService.log('Message sent ' + info.response)
      return true
    } catch (error) {
      this.loggerService.error(`NodeMailer ${error}`)

      await this.authSqlRepository.deleteConfirmationByCodeORUserId(id)
      return null
    }
  }
}

export { PasswordRecoveryUseCase, PasswordRecoveryCommand }
