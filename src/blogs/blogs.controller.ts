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
} from '@nestjs/common'
import { BlogsService } from './blogs.service'
import { CreateBlogDto, UpdateBlogDto } from './dto'
import { GetBlogsRequestQuery } from './interfaces'
import { BasePostDto } from '../posts'

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

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

  @Get(':id/posts')
  private async getPostsByBlogId(
    @Param('id') id: string,
    @Query() query: Omit<GetBlogsRequestQuery<string>, 'searchNameTerm'>,
  ) {
    const result = await this.blogsService.getById(id)

    if (!result) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return await this.blogsService.getPostsByBlogId({
      id,
      query,
    })
  }

  @Post(':id/posts')
  private async createPostByBlogId(
    @Param('id') id: string,
    @Body() body: BasePostDto,
  ) {
    const result = await this.blogsService.getById(id)

    if (!result) {
      throw new NotFoundException({ message: 'blog is not exists' })
    }

    return await this.blogsService.createPostsByBlogId({ id, body })
  }

  @Post()
  private async create(@Body() body: CreateBlogDto) {
    return await this.blogsService.create(body)
  }

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
