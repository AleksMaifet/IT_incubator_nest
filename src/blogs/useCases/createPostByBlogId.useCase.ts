import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import { Post, PostsSqlRepository } from '../../posts'
import { BlogsSqlRepository } from '../repositories'
import { BasePostDto } from '../dto'

class CreatePostByBlogIdCommand {
  constructor(public readonly payload: { id: string; body: BasePostDto }) {}
}

@CommandHandler(CreatePostByBlogIdCommand)
class CreatePostByBlogIdUseCase
  implements ICommandHandler<CreatePostByBlogIdCommand>
{
  constructor(
    private readonly blogsSqlRepository: BlogsSqlRepository,
    @Inject(forwardRef(() => PostsSqlRepository))
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: CreatePostByBlogIdCommand) {
    const { body, id } = command.payload
    const { title, shortDescription, content } = body

    const blog = await this.blogsSqlRepository.getById(id)

    const newPost = new Post(
      title,
      shortDescription,
      content,
      blog.id,
      blog.name,
    )

    return await this.postsSqlRepository.create(newPost)
  }
}

export { CreatePostByBlogIdUseCase, CreatePostByBlogIdCommand }
