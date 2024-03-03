import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthSqlRepository } from '../auth.sql.repository'
import { UsersSqlRepository } from '../../users'
import { AuthService } from '../auth.service'

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
    private readonly authService: AuthService,
  ) {}

  async execute(command: RegistrationEmailResendingCommand) {
    const user = await this.usersSqlRepository.getByLoginOrEmail(command.email)

    const { id, login, email } = user

    const newConfirmation =
      await this.authSqlRepository.updateEmailConfirmationCode(id)

    const { code } = newConfirmation

    return await this.authService.sendEmailConfirmationCode({
      id,
      email,
      login,
      code,
    })
  }
}

export { RegistrationEmailResendingUseCase, RegistrationEmailResendingCommand }
