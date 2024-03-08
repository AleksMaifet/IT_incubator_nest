import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Logger } from '@nestjs/common'
import { AuthSqlRepository } from '../repositories'
import { UsersSqlRepository } from '../../users'
import { ManagerEmail } from '../../managers'

class RegistrationEmailResendingCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(RegistrationEmailResendingCommand)
class RegistrationEmailResendingUseCase
  implements ICommandHandler<RegistrationEmailResendingCommand>
{
  constructor(
    private readonly authSqlRepository: AuthSqlRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly managerEmail: ManagerEmail,
    private readonly loggerService: Logger,
  ) {}

  async execute(command: RegistrationEmailResendingCommand) {
    const user = await this.usersSqlRepository.getByLoginOrEmail(command.email)

    const { id, login, email } = user

    const newConfirmation =
      await this.authSqlRepository.updateEmailConfirmationCode(id)

    const { code } = newConfirmation

    try {
      const info =
        await this.managerEmail.sendUserRegistrationEmailResendingCode({
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

export { RegistrationEmailResendingUseCase, RegistrationEmailResendingCommand }
