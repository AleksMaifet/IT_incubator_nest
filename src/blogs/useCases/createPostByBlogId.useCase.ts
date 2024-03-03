import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { BasePostDto, Post, PostsRepository } from '../../posts'
import { BlogsService } from '../blogs.service'

class CreatePostByBlogIdCommand {
  constructor(public readonly payload: { id: string; body: BasePostDto }) {}
}

@CommandHandler(CreatePostByBlogIdCommand)
class CreatePostByBlogIdUseCase
  implements ICommandHandler<CreatePostByBlogIdCommand>
{
  constructor(
    private readonly blogsService: BlogsService,
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostByBlogIdCommand) {
    const { body, id } = command.payload
    const { title, shortDescription, content } = body

    const blog = await this.blogsService.getById(id)

    const newPost = new Post(
      title,
      shortDescription,
      content,
      blog.id,
      blog.name,
    )

    return await this.postsRepository.create(newPost)
  }
}

export { CreatePostByBlogIdUseCase, CreatePostByBlogIdCommand }
