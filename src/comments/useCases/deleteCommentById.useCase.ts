import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CommentsSqlRepository } from '../repositories'

class DeleteCommentByIdCommand {
  constructor(public readonly payload: string) {}
}

@CommandHandler(DeleteCommentByIdCommand)
class DeleteCommentByIdUseCase
  implements ICommandHandler<DeleteCommentByIdCommand>
{
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}

  async execute(command: DeleteCommentByIdCommand) {
    return await this.commentsSqlRepository.deleteById(command.payload)
  }
}

export { DeleteCommentByIdUseCase, DeleteCommentByIdCommand }
