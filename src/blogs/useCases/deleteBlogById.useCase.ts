import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BlogsSqlRepository } from '../repositories'

class DeleteBlogByIdCommand {
  constructor(public readonly payload: string) {}
}

@CommandHandler(DeleteBlogByIdCommand)
class DeleteBlogByIdUseCase implements ICommandHandler<DeleteBlogByIdCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: DeleteBlogByIdCommand) {
    return await this.blogsSqlRepository.deleteById(command.payload)
  }
}

export { DeleteBlogByIdUseCase, DeleteBlogByIdCommand }
