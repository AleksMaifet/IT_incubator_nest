import {
  Controller,
  Get,
  NotFoundException,
  Query,
  UseInterceptors,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { GetBlogsRequestQuery } from '../interfaces'
import {
  GetAllBlogsCommand,
  GetBlogByIdCommand,
  GetPostsByBlogIdCommand,
} from '../useCases'
import { User, UUIDParam } from '../../libs/decorators'
import { HttpRequestHeaderUserInterceptor } from '../../libs/interceptors'
import { IJwtUser } from '../../libs/interfaces'

@Controller('blogs')
export class BlogsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Get()
  private async getAll(@Query() query: GetBlogsRequestQuery<string>) {
    return await this.commandBus.execute(new GetAllBlogsCommand(query))
  }

  @Get(':id')
  private async getById(@UUIDParam('id') id: string) {
    const result = await this.commandBus.execute(new GetBlogByIdCommand(id))

    if (!result) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return result
  }

  @UseInterceptors(HttpRequestHeaderUserInterceptor)
  @Get(':id/posts')
  private async getPostsByBlogId(
    @UUIDParam('id') id: string,
    @Query() query: Omit<GetBlogsRequestQuery<string>, 'searchNameTerm'>,
    @User() user: IJwtUser,
  ) {
    const result = await this.commandBus.execute(new GetBlogByIdCommand(id))

    if (!result) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return await this.commandBus.execute(
      new GetPostsByBlogIdCommand({
        id,
        userId: user?.userId,
        query,
      }),
    )
  }
}
