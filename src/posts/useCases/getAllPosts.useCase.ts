import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import {
  GetPostsRequestQuery,
  PostsService,
  PostsSqlRepository,
} from '../../posts'
import { LikesService } from '../../likes'

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
    private readonly likesService: LikesService,
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

    const likes = await this.likesService.getUserLikesByUserId(userId)

    if (!likes) {
      return posts
    }

    const { likeStatusPosts } = likes

    return this.postsService.mapGenerateLikeResponse(posts, likeStatusPosts)
  }
}

export { GetAllPostsUseCase, GetAllPostsCommand }
