import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { IUser } from '../../users'
import { CommentInfoLikeType, LikesSqlRepository } from '../../likes'
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

    const likeStatusComments = await this.likesSqlRepository.createCommentLike({
      userId: id,
      userLogin: login,
      commentId,
    })

    const isExist = likeStatusComments.findIndex(
      (info: CommentInfoLikeType) =>
        info.commentId === commentId && info.status === likeStatus,
    )

    if (isExist !== -1) return

    const isFirst = likeStatusComments.findIndex(
      (info: CommentInfoLikeType) =>
        info.commentId === commentId && info.addedAt,
    )

    await this.likesSqlRepository.updateUserCommentLikes({
      userId: id,
      likeStatus,
      commentId,
    })

    return this.commentsSqlRepository.updateLikeWithStatusLikeOrDislike({
      isFirstTime: isFirst === -1,
      likeStatus,
      commentId,
    })
  }
}

export { UpdateCommentLikeByIdUseCase, UpdateCommentLikeByIdCommand }
