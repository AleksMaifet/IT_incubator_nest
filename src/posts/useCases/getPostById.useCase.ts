import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import { PostsSqlRepository } from '../../posts'
import { LikesService } from '../../likes'

class GetPostByIdCommand {
  constructor(public readonly payload: { id: string; userId: string }) {}
}

@CommandHandler(GetPostByIdCommand)
class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    private readonly likesService: LikesService,
    @Inject(forwardRef(() => PostsSqlRepository))
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: GetPostByIdCommand) {
    const { id, userId } = command.payload

    const post = await this.postsSqlRepository.getById(id)

    if (!post) return null

    if (!userId) {
      return post
    }

    const likes = await this.likesService.getUserLikesByUserId(userId)

    if (!likes) {
      return post
    }

    likes.likeStatusPosts.forEach((l) => {
      if (l.postId === post.id) {
        post.extendedLikesInfo = {
          ...post.extendedLikesInfo,
          myStatus: l.status,
        }
      }
    })

    return post
  }
}

export { GetPostByIdUseCase, GetPostByIdCommand }
