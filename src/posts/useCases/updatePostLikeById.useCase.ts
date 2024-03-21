import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import {
  BasePostLikeDto,
  PostsSqlRepository,
  UserLikeInfoEntity,
} from '../../posts'
import { IUser } from '../../users'
import { LikesSqlRepository, PostInfoLikeType } from '../../likes'

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

    const {
      userId,
      login: userLogin,
      addedAt,
    } = new UserLikeInfoEntity(id, login)

    const likeStatusPosts = await this.likesSqlRepository.createPostLike({
      userId,
      userLogin,
      postId,
    })

    const isExist = likeStatusPosts.findIndex(
      (info: PostInfoLikeType) =>
        info.postId === postId && info.status === likeStatus,
    )

    if (isExist !== -1) return

    const isFirst = likeStatusPosts.findIndex(
      (info: PostInfoLikeType) => info.postId === postId && info.addedAt,
    )

    await this.likesSqlRepository.updateUserPostLikes({
      userId,
      likeStatus,
      postId,
      addedAt,
    })

    return await this.postsSqlRepository.updateLikeWithStatusLikeOrDislike({
      isFirstTime: isFirst === -1,
      likeStatus,
      postId,
    })
  }
}

export { UpdatePostLikeByIdUseCase, UpdatePostLikeByIdCommand }
