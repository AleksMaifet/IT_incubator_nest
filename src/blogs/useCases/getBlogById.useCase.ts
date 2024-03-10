import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BlogsSqlRepository } from '../repositories'

class GetBlogByIdCommand {
  constructor(public readonly payload: string) {}
}

@CommandHandler(GetBlogByIdCommand)
class GetBlogByIdUseCase implements ICommandHandler<GetBlogByIdCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: GetBlogByIdCommand) {
    return await this.blogsSqlRepository.getById(command.payload)
  }
}

export { GetBlogByIdUseCase, GetBlogByIdCommand }
