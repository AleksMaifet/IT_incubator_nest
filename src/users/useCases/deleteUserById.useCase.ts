import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UsersSqlRepository } from '../users.sql.repository'

class DeleteUserByIdCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteUserByIdCommand)
class DeleteUserByIdUseCase implements ICommandHandler<DeleteUserByIdCommand> {
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

  async execute(command: DeleteUserByIdCommand) {
    return await this.usersSqlRepository.deleteById(command.id)
  }
}

export { DeleteUserByIdCommand, DeleteUserByIdUseCase }
