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
import { PostsService } from './posts.service'
import { GetPostsRequestQuery } from './interfaces'
import { CreatePostDto, UpdatePostDto } from './dto'
import { CommentsService, GetCommentsRequestQuery } from '../comments'

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get()
  private async getAll(@Query() query: GetPostsRequestQuery<string>) {
    return await this.postsService.getAll(query)
  }

  @Get(':id')
  private async getById(@Param('id') id: string) {
    const result = await this.postsService.getById(id)

    if (!result) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    return result
  }

  @Post()
  private async create(@Body() body: CreatePostDto) {
    return await this.postsService.create(body)
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updateById(
    @Param('id') id: string,
    @Body() body: UpdatePostDto,
  ) {
    const result = await this.postsService.updateById({ id, dto: body })

    if (!result) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    return result
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteById(@Param('id') id: string) {
    const result = await this.postsService.deleteById(id)

    if (!result) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    return result
  }

  @Get(':id/comments')
  private async getAllCommentById(
    @Param('id') id: string,
    @Query() query: GetCommentsRequestQuery<string>,
  ) {
    const result = await this.commentsService.getAllByPostId({
      postId: id,
      query,
    })

    if (!result) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    return result
  }
}
