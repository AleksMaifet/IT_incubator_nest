import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { UpdateBlogDto } from '../dto'
import { BlogsSqlRepository } from '../repositories'

class UpdateBlogByIdCommand {
  constructor(
    public readonly payload: {
      id: string
      dto: UpdateBlogDto
    },
  ) {}
}

@CommandHandler(UpdateBlogByIdCommand)
class UpdateBlogByIdUseCase implements ICommandHandler<UpdateBlogByIdCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: UpdateBlogByIdCommand) {
    const { id, dto } = command.payload

    return await this.blogsSqlRepository.updateById(id, dto)
  }
}

export { UpdateBlogByIdUseCase, UpdateBlogByIdCommand }
