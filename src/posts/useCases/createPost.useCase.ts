import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import { CreatePostDto, Post, PostsSqlRepository } from '../../posts'
import { BlogsSqlRepository } from '../../blogs'

class CreatePostCommand {
  constructor(public readonly payload: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(forwardRef(() => BlogsSqlRepository))
    private readonly blogsSqlRepository: BlogsSqlRepository,
    @Inject(forwardRef(() => PostsSqlRepository))
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const { title, shortDescription, content, blogId } = command.payload

    const { id, name } = await this.blogsSqlRepository.getById(blogId)

    const newPost = new Post(title, shortDescription, content, id, name)

    return await this.postsSqlRepository.create(newPost)
  }
}

export { CreatePostUseCase, CreatePostCommand }
