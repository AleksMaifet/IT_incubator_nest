import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import { Post, PostsSqlRepository } from '../../posts'
import { BasePostDto } from '../dto'

class CreatePostByBlogIdCommand {
  constructor(public readonly payload: { id: string; body: BasePostDto }) {}
}

@CommandHandler(CreatePostByBlogIdCommand)
class CreatePostByBlogIdUseCase
  implements ICommandHandler<CreatePostByBlogIdCommand>
{
  constructor(
    @Inject(forwardRef(() => PostsSqlRepository))
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: CreatePostByBlogIdCommand) {
    const { body, id } = command.payload
    const { title, shortDescription, content } = body

    const newPost = new Post(title, shortDescription, content)

    return await this.postsSqlRepository.create({ dto: newPost, blogId: id })
  }
}

export { CreatePostByBlogIdUseCase, CreatePostByBlogIdCommand }
