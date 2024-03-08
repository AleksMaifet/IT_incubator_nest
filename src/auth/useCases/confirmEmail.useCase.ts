import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthSqlRepository } from '../repositories'

class ConfirmEmailCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
class ConfirmEmailUseCase implements ICommandHandler<ConfirmEmailCommand> {
  constructor(private readonly authSqlRepository: AuthSqlRepository) {}

  async execute(command: ConfirmEmailCommand) {
    return await this.authSqlRepository.deleteConfirmationByCodeORUserId(
      command.code,
    )
  }
}

export { ConfirmEmailUseCase, ConfirmEmailCommand }
