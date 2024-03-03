import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { User, UsersService, UsersSqlRepository } from '../../users'
import { EmailConfirmation } from '../entities'
import { AuthSqlRepository } from '../auth.sql.repository'
import { AuthService } from '../auth.service'
import { AuthRegNewUserDto } from '../dto'

class CreateUserCommand {
  constructor(public readonly payload: AuthRegNewUserDto) {}
}

@CommandHandler(CreateUserCommand)
class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly authSqlRepository: AuthSqlRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
  ) {}

  async execute(command: CreateUserCommand) {
    const { login, email, password } = command.payload

    const passwordSalt = await this.usersService.generateSalt()
    const passwordHash = await this.usersService.generateHash(
      password,
      passwordSalt,
    )
    const newUser = new User(login, email, passwordSalt, passwordHash)

    const { id } = await this.usersSqlRepository.create(newUser)

    const newEmailConfirmation = new EmailConfirmation(id)
    const { code } = newEmailConfirmation

    await this.authSqlRepository.createEmailConfirmation(newEmailConfirmation)

    return await this.authService.sendEmailConfirmationCode({
      id,
      email,
      login,
      code,
    })
  }
}

export { CreateUserUseCase, CreateUserCommand }
