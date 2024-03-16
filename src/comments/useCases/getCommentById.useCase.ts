import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CommentsSqlRepository } from '../repositories'
import { LikesRepository } from '../../likes'

class GetCommentByIdCommand {
  constructor(public readonly payload: { id: string; userId: string }) {}
}

@CommandHandler(GetCommentByIdCommand)
class GetCommentByIdUseCase implements ICommandHandler<GetCommentByIdCommand> {
  constructor(
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly likesRepository: LikesRepository,
  ) {}

  async execute(command: GetCommentByIdCommand) {
    const { id, userId } = command.payload

    const comment = await this.commentsSqlRepository.getById(id)

    if (!comment) return null

    if (!userId) {
      return comment
    }

    const likes = await this.likesRepository.getUserLikesByUserId(userId)

    if (!likes) {
      return comment
    }

    likes.likeStatusComments.forEach((l) => {
      if (l.commentId === comment.id) {
        comment.likesInfo = {
          ...comment.likesInfo,
          myStatus: l.status,
        }
      }
    })

    return comment
  }
}

export { GetCommentByIdUseCase, GetCommentByIdCommand }
