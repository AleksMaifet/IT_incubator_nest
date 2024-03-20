import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import { PostsSqlRepository } from '../../posts'
import { LikesSqlRepository } from '../../likes'

class GetPostByIdCommand {
  constructor(public readonly payload: { id: string; userId: string }) {}
}

@CommandHandler(GetPostByIdCommand)
class GetPostByIdUseCase implements ICommandHandler<GetPostByIdCommand> {
  constructor(
    private readonly likesSqlRepository: LikesSqlRepository,
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

    const likes = await this.likesSqlRepository.getPostLikesByUserId(userId)

    if (!likes) {
      return post
    }

    likes.forEach((l) => {
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
