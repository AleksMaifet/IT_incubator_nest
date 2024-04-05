import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import { CreatePostDto, Post, PostsSqlRepository } from '../../posts'

class CreatePostCommand {
  constructor(public readonly payload: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(forwardRef(() => PostsSqlRepository))
    private readonly postsSqlRepository: PostsSqlRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const { title, shortDescription, content, blogId } = command.payload

    const newPost = new Post(title, shortDescription, content)

    return await this.postsSqlRepository.create({ dto: newPost, blogId })
  }
}

export { CreatePostUseCase, CreatePostCommand }
