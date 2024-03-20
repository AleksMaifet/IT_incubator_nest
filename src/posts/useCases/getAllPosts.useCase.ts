import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import {
  GetPostsRequestQuery,
  PostsService,
  PostsSqlRepository,
} from '../../posts'
import { LikesSqlRepository } from '../../likes'

class GetAllPostsCommand {
  constructor(
    public readonly payload: {
      userId: string
      query: GetPostsRequestQuery<string>
    },
  ) {}
}

@CommandHandler(GetAllPostsCommand)
class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(
    @Inject(forwardRef(() => PostsService))
    private readonly postsService: PostsService,
    private readonly likesSqlRepository: LikesSqlRepository,
    @Inject(forwardRef(() => PostsSqlRepository))
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: GetAllPostsCommand) {
    const { query, userId } = command.payload

    const dto = this.postsService.mapQueryParamsToDB(query)

    const posts = await this.postsSqlRepository.getAll(dto)

    if (!userId) {
      return posts
    }

    const likes = await this.likesSqlRepository.getPostLikesByUserId(userId)

    if (!likes) {
      return posts
    }

    return this.postsService.mapGenerateLikeResponse(posts, likes)
  }
}

export { GetAllPostsUseCase, GetAllPostsCommand }
