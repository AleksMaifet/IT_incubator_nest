import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PostsService, PostsSqlRepository } from '../../posts'
import { LikesSqlRepository } from '../../likes'
import { GetBlogsRequestQuery } from '../interfaces'

class GetPostsByBlogIdCommand {
  constructor(
    public readonly payload: {
      id: string
      userId: string
      query: Omit<GetBlogsRequestQuery<string>, 'searchNameTerm'>
    },
  ) {}
}

@CommandHandler(GetPostsByBlogIdCommand)
class GetPostsByBlogIdUseCase
  implements ICommandHandler<GetPostsByBlogIdCommand>
{
  constructor(
    private readonly postsService: PostsService,
    private readonly likesSqlRepository: LikesSqlRepository,
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: GetPostsByBlogIdCommand) {
    const { query, id, userId } = command.payload

    const dto = this.postsService.mapQueryParamsToDB(query)

    const posts = await this.postsSqlRepository.getPostsByBlogId(id, dto)

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

export { GetPostsByBlogIdUseCase, GetPostsByBlogIdCommand }
