import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import { PostsSqlRepository } from '../../posts'

class DeletePostByIdCommand {
  constructor(public readonly payload: string) {}
}

@CommandHandler(DeletePostByIdCommand)
class DeletePostByIdUseCase implements ICommandHandler<DeletePostByIdCommand> {
  constructor(
    @Inject(forwardRef(() => PostsSqlRepository))
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: DeletePostByIdCommand) {
    return await this.postsSqlRepository.deleteById(command.payload)
  }
}

export { DeletePostByIdUseCase, DeletePostByIdCommand }
