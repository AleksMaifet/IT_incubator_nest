import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { PostsService } from '../../posts'
import { GetBlogsRequestQuery } from '../interfaces'

class GetPostsByBlogIdCommand {
  constructor(
    public payload: {
      id: string
      query: Omit<GetBlogsRequestQuery<string>, 'searchNameTerm'>
    },
  ) {}
}

@CommandHandler(GetPostsByBlogIdCommand)
class GetPostsByBlogIdUseCase
  implements ICommandHandler<GetPostsByBlogIdCommand>
{
  constructor(private readonly postsService: PostsService) {}

  async execute(command: GetPostsByBlogIdCommand) {
    return await this.postsService.getPostsByBlogId(command.payload)
  }
}

export { GetPostsByBlogIdUseCase, GetPostsByBlogIdCommand }
