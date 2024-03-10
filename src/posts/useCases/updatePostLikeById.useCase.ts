import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import {
  BasePostLikeDto,
  PostsRepository,
  UserLikeInfoEntity,
} from '../../posts'
import { IUser } from '../../users'
import { LikesService } from '../../likes'

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
    private readonly likesService: LikesService,
    @Inject(forwardRef(() => PostsRepository))
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdatePostLikeByIdCommand) {
    const {
      postId,
      likeStatus,
      user: { id, login },
    } = command.payload

    const newUserLikeInfo = new UserLikeInfoEntity(id, login)

    const { likeStatusPosts } = await this.likesService.create({
      userId: id,
      userLogin: login,
    })

    if (!likeStatusPosts) return

    const isExist = likeStatusPosts.findIndex(
      (info) => info.postId === postId && info.status === likeStatus,
    )

    const isFirst = likeStatusPosts.findIndex((info) => info.postId === postId)

    if (isExist !== -1) {
      return
    }

    await this.likesService.updateUserPostLikes({
      userId: id,
      likeStatus,
      postId,
    })

    await this.postsRepository.updateLikeWithStatusLikeOrDislike({
      isFirstTime: isFirst === -1,
      likeStatus,
      postId,
      userLikeInfo: newUserLikeInfo,
    })

    return true
  }
}

export { UpdatePostLikeByIdUseCase, UpdatePostLikeByIdCommand }
