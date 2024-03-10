import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { CreateBlogDto } from '../dto'
import { Blog } from '../blog.entity'
import { BlogsSqlRepository } from '../repositories'

class CreateBlogCommand {
  constructor(public readonly payload: CreateBlogDto) {}
}

@CommandHandler(CreateBlogCommand)
class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: CreateBlogCommand) {
    const { name, description, websiteUrl } = command.payload

    const newBlog = new Blog(name, description, websiteUrl)

    return await this.blogsSqlRepository.create(newBlog)
  }
}

export { CreateBlogUseCase, CreateBlogCommand }
