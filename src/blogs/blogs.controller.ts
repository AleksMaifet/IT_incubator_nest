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
import { BlogsService } from './blogs.service'
import { CreateBlogDto, UpdateBlogDto } from './dto'
import { GetBlogsRequestQuery } from './interfaces'
import { BasePostDto } from '../posts'
import { CreatePostByBlogIdCommand, GetPostsByBlogIdCommand } from './useCases'
import { User } from '../libs/decorators'
import { HttpRequestHeaderUserInterceptor } from '../libs/interceptors'
import { IJwtUser } from '../libs/interfaces'
import { BasicAuthGuard } from '../libs/guards'

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  private async getAll(@Query() query: GetBlogsRequestQuery<string>) {
    return await this.blogsService.getAll(query)
  }

  @Get(':id')
  private async getById(@Param('id') id: string) {
    const result = await this.blogsService.getById(id)

    if (!result) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return result
  }

  @UseInterceptors(HttpRequestHeaderUserInterceptor)
  @Get(':id/posts')
  private async getPostsByBlogId(
    @Param('id') id: string,
    @Query() query: Omit<GetBlogsRequestQuery<string>, 'searchNameTerm'>,
    @User() user: IJwtUser,
  ) {
    const result = await this.blogsService.getById(id)

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
    @Param('id') id: string,
    @Body() body: BasePostDto,
  ) {
    const result = await this.blogsService.getById(id)

    if (!result) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return await this.commandBus.execute(
      new CreatePostByBlogIdCommand({ id, body }),
    )
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  private async create(@Body() body: CreateBlogDto) {
    return await this.blogsService.create(body)
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updateById(
    @Param('id') id: string,
    @Body() body: UpdateBlogDto,
  ) {
    const result = await this.blogsService.updateById(id, body)

    if (!result) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return result
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteById(@Param('id') id: string) {
    const result = await this.blogsService.deleteById(id)

    if (!result) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return result
  }
}
