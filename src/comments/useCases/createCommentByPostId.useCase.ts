import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CommentsSqlRepository } from '../repositories'
import { IComments } from '../interfaces'
import { Comment } from '../comment.entity'

class CreateCommentByPostIdCommand {
  constructor(
    public readonly payload: Pick<IComments, 'content' | 'commentatorInfo'> & {
      postId: string
    },
  ) {}
}

@CommandHandler(CreateCommentByPostIdCommand)
class CreateCommentByPostIdUseCase
  implements ICommandHandler<CreateCommentByPostIdCommand>
{
  constructor(private readonly commentsSqlRepository: CommentsSqlRepository) {}

  async execute(command: CreateCommentByPostIdCommand) {
    const { postId, content, commentatorInfo } = command.payload

    const newComment = new Comment(postId, content, commentatorInfo)

    return await this.commentsSqlRepository.create(newComment)
  }
}

export { CreateCommentByPostIdUseCase, CreateCommentByPostIdCommand }
