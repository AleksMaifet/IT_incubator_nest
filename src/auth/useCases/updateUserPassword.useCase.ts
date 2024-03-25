import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { AuthUpdatePassDto } from '../dto'
import { UsersService, UsersSqlRepository } from '../../users'
import { AuthSqlRepository } from '../repositories'

class UpdateUserPasswordCommand {
  constructor(public readonly payload: AuthUpdatePassDto) {}
}

@CommandHandler(UpdateUserPasswordCommand)
class UpdateUserPasswordUseCase
  implements ICommandHandler<UpdateUserPasswordCommand>
{
  constructor(
    private readonly usersService: UsersService,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly authSqlRepository: AuthSqlRepository,
  ) {}

  async execute(command: UpdateUserPasswordCommand) {
    const { recoveryCode, newPassword } = command.payload

    const confirmation =
      await this.authSqlRepository.getConfirmationByCodeOrUserId(recoveryCode)

    const userId = confirmation.user.id

    await this.authSqlRepository.deleteConfirmationByCodeORUserId(userId)

    const passwordSalt = await this.usersService.generateSalt()
    const passwordHash = await this.usersService.generateHash(
      newPassword,
      passwordSalt,
    )

    return await this.usersSqlRepository.updatePassword({
      id: userId,
      passwordSalt,
      passwordHash,
    })
  }
}

export { UpdateUserPasswordUseCase, UpdateUserPasswordCommand }
