import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { Logger } from '@nestjs/common'
import { User, UsersService, UsersSqlRepository } from '../../users'
import { EmailConfirmation } from '../entities'
import { AuthSqlRepository } from '../repositories'
import { AuthRegNewUserDto } from '../dto'
import { ManagerEmail } from '../../managers'

class CreateUserCommand {
  constructor(public readonly payload: AuthRegNewUserDto) {}
}

@CommandHandler(CreateUserCommand)
class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersService: UsersService,
    private readonly authSqlRepository: AuthSqlRepository,
    private readonly usersSqlRepository: UsersSqlRepository,
    private readonly managerEmail: ManagerEmail,
    private readonly loggerService: Logger,
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

export { CreateUserUseCase, CreateUserCommand }
