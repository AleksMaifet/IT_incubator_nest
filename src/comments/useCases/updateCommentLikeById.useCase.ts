import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { IUser } from '../../users'
import { LikesSqlRepository } from '../../likes'
import { BaseCommentLikeDto } from '../dto'
import { CommentsSqlRepository } from '../repositories'

class UpdateCommentLikeByIdCommand {
  constructor(
    public readonly payload: {
      commentId: string
      user: Pick<IUser, 'id' | 'login'>
    } & BaseCommentLikeDto,
  ) {}
}

@CommandHandler(UpdateCommentLikeByIdCommand)
class UpdateCommentLikeByIdUseCase
  implements ICommandHandler<UpdateCommentLikeByIdCommand>
{
  constructor(
    private readonly commentsSqlRepository: CommentsSqlRepository,
    private readonly likesSqlRepository: LikesSqlRepository,
  ) {}

  async execute(command: UpdateCommentLikeByIdCommand) {
    const {
      commentId,
      likeStatus,
      user: { id, login },
    } = command.payload

    const commentLike = await this.likesSqlRepository.getOrCreateCommentLike({
      userId: id,
      userLogin: login,
      commentId,
    })

    const isExist = commentLike.status === likeStatus

    if (isExist) return

    await this.likesSqlRepository.updateUserCommentLikes({
      userId: id,
      likeStatus,
      commentId,
    })

    return this.commentsSqlRepository.updateLikeWithStatusLikeOrDislike({
      isFirstTime: !commentLike.addedAt,
      likeStatus,
      commentId,
    })
  }
}

export { UpdateCommentLikeByIdUseCase, UpdateCommentLikeByIdCommand }
