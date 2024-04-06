import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import {
  BasePostDto,
  CreateBlogDto,
  DeletePostByIdDto,
  UpdateBlogDto,
  UpdatePostByIdDto,
} from '../dto'
import { GetBlogsRequestQuery } from '../interfaces'
import {
  CreateBlogCommand,
  CreatePostByBlogIdCommand,
  DeleteBlogByIdCommand,
  GetAllBlogsCommand,
  GetBlogByIdCommand,
  GetPostsByBlogIdCommand,
  UpdateBlogByIdCommand,
} from '../useCases'
import { User, UUIDParam } from '../../libs/decorators'
import { HttpRequestHeaderUserInterceptor } from '../../libs/interceptors'
import { IJwtUser } from '../../libs/interfaces'
import { BasicAuthGuard } from '../../libs/guards'
import {
  DeletePostByIdCommand,
  UpdatePostByIdCommand,
} from '../../posts/useCases'

@Controller('sa/blogs')
export class BlogsSupeAdminController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  private async getAll(@Query() query: GetBlogsRequestQuery<string>) {
    return await this.commandBus.execute(new GetAllBlogsCommand(query))
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  private async create(@Body() body: CreateBlogDto) {
    return await this.commandBus.execute(new CreateBlogCommand(body))
  }

  @UseGuards(BasicAuthGuard)
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

  @UseGuards(BasicAuthGuard)
  @Post(':id/posts')
  private async createPostByBlogId(
    @UUIDParam('id') id: string,
    @Body() body: BasePostDto,
  ) {
    const result = await this.commandBus.execute(new GetBlogByIdCommand(id))

    if (!result) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return await this.commandBus.execute(
      new CreatePostByBlogIdCommand({ id, body }),
    )
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updateById(
    @UUIDParam('id') id: string,
    @Body() body: UpdateBlogDto,
  ) {
    const result = await this.commandBus.execute(
      new UpdateBlogByIdCommand({
        id,
        dto: body,
      }),
    )

    if (!result) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return result
  }

  @UseGuards(BasicAuthGuard)
  @UseInterceptors(HttpRequestHeaderUserInterceptor)
  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updatePostById(
    @Param() param: UpdatePostByIdDto,
    @Body() body: BasePostDto,
  ) {
    const { blogId, postId } = param
    const { title, shortDescription, content } = body

    return await this.commandBus.execute(
      new UpdatePostByIdCommand({
        id: postId,
        dto: {
          title,
          content,
          shortDescription,
          blogId,
        },
      }),
    )
  }

  @UseGuards(BasicAuthGuard)
  @UseInterceptors(HttpRequestHeaderUserInterceptor)
  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deletePostById(
    @Param() param: DeletePostByIdDto,
    @User() user: IJwtUser,
  ) {
    const { postId } = param

    return await this.commandBus.execute(new DeletePostByIdCommand(postId))
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteById(@UUIDParam('id') id: string) {
    const result = await this.commandBus.execute(new DeleteBlogByIdCommand(id))

    if (!result) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return result
  }
}
