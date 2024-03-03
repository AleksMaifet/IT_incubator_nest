import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersService, UsersSqlRepository } from '../../users'
import { BaseAuthDto } from '../dto'

class LoginUserCommand {
  constructor(public readonly payload: BaseAuthDto) {}
}

@CommandHandler(LoginUserCommand)
class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {}

  async execute(command: LoginUserCommand) {
    const { loginOrEmail, password } = command.payload

    const user = await this.usersSqlRepository.getByLoginOrEmail(loginOrEmail)

    if (!user) return false

    const { id, passwordSalt, passwordHash: userPasswordHash } = user

    const passwordHash = await this.usersService.generateHash(
      password,
      passwordSalt,
    )

    if (passwordHash !== userPasswordHash) {
      return false
    }

    return id
  }
}

export { LoginUserUseCase, LoginUserCommand }
