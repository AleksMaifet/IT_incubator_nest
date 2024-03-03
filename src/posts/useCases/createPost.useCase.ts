import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { forwardRef, Inject } from '@nestjs/common'
import { CreatePostDto, Post, PostsRepository } from '../../posts'
import { BlogsService } from '../../blogs'

class CreatePostCommand {
  constructor(public readonly payload: CreatePostDto) {}
}

@CommandHandler(CreatePostCommand)
class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(forwardRef(() => BlogsService))
    private readonly blogsService: BlogsService,
    @Inject(forwardRef(() => PostsRepository))
    private readonly postsRepository: PostsRepository,
  ) {}

  async execute(command: CreatePostCommand) {
    const { title, shortDescription, content, blogId } = command.payload

    const { id, name } = await this.blogsService.getById(blogId)

    const newPost = new Post(title, shortDescription, content, id, name)

    return await this.postsRepository.create(newPost)
  }
}

export { CreatePostUseCase, CreatePostCommand }
