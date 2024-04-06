import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import { BasePostLikeDto, PostsSqlRepository } from '../../posts'
import { IUser } from '../../users'
import { LikesSqlRepository } from '../../likes'

class UpdatePostLikeByIdCommand {
  constructor(
    public readonly payload: {
      postId: string
      user: Pick<IUser, 'id' | 'login'>
    } & BasePostLikeDto,
  ) {}
}

@CommandHandler(UpdatePostLikeByIdCommand)
class UpdatePostLikeByIdUseCase
  implements ICommandHandler<UpdatePostLikeByIdCommand>
{
  constructor(
    private readonly likesSqlRepository: LikesSqlRepository,
    @Inject(forwardRef(() => PostsSqlRepository))
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: UpdatePostLikeByIdCommand) {
    const {
      postId,
      likeStatus,
      user: { id, login },
    } = command.payload

    const postsLike = await this.likesSqlRepository.getOrCreatePostLike({
      userId: id,
      userLogin: login,
      postId,
    })

    const isExist = postsLike.status === likeStatus

    if (isExist) return

    await this.likesSqlRepository.updateUserPostLikes({
      userId: id,
      likeStatus,
      postId,
    })

    return await this.postsSqlRepository.updateLikeWithStatusLikeOrDislike({
      isFirstTime: !postsLike.addedAt,
      likeStatus,
      postId,
    })
  }
}

export { UpdatePostLikeByIdUseCase, UpdatePostLikeByIdCommand }
