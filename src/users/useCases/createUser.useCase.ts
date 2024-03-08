import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersService } from '../users.service'
import { UsersSqlRepository } from '../repositories'
import { CreateUserDto } from '../dto'
import { User } from '../user.entity'

class CreateUserCommand {
  constructor(public readonly payload: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersService: UsersService,
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

    return await this.usersSqlRepository.create(newUser)
  }
}

export { CreateUserUseCase, CreateUserCommand }
