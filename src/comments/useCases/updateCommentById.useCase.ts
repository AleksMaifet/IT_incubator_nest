import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CommentsSqlRepository } from '../repositories'
import { IComments } from '../interfaces'

class UpdateCommentByIdCommand {
  constructor(public readonly payload: Pick<IComments, 'id' | 'content'>) {}
}

@CommandHandler(UpdateCommentByIdCommand)
class UpdateCommentByIdUseCase
  implements ICommandHandler<UpdateCommentByIdCommand>
{
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}

  async execute(command: UpdateCommentByIdCommand) {
    return await this.commentsSqlRepository.updateById(command.payload)
  }
}

export { UpdateCommentByIdUseCase, UpdateCommentByIdCommand }
