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
  BaseCommentDto,
  CommentsService,
  GetCommentsRequestQuery,
} from '../comments'
import { PostsService } from './posts.service'
import { GetPostsRequestQuery } from './interfaces'
import { BasePostLikeDto, CreatePostDto, UpdatePostDto } from './dto'
import { CreatePostCommand } from './useCases'
import { User } from '../libs/decorators'
import { HttpRequestHeaderUserInterceptor } from '../libs/interceptors'
import { IJwtUser } from '../libs/interfaces'
import { BasicAuthGuard, JwtAuthGuard } from '../libs/guards'

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private commandBus: CommandBus,
  ) {}

  @UseInterceptors(HttpRequestHeaderUserInterceptor)
  @Get()
  private async getAll(
    @Query() query: GetPostsRequestQuery<string>,
    @User() user: IJwtUser,
  ) {
    return await this.postsService.getAll({
      userId: user?.userId,
      query,
    })
  }

  @UseInterceptors(HttpRequestHeaderUserInterceptor)
  @Get(':id')
  private async getById(@Param('id') id: string, @User() user: IJwtUser) {
    const result = await this.postsService.getById({
      id,
      userId: user?.userId,
    })

    if (!result) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    return result
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  private async create(@Body() body: CreatePostDto) {
    return await this.commandBus.execute(new CreatePostCommand(body))
  }

  @UseGuards(BasicAuthGuard)
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

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteById(@Param('id') id: string) {
    const result = await this.postsService.deleteById(id)

    if (!result) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    return result
  }

  @UseInterceptors(HttpRequestHeaderUserInterceptor)
  @Get(':id/comments')
  private async getAllCommentById(
    @Param('id') id: string,
    @User() user: IJwtUser,
    @Query() query: GetCommentsRequestQuery<string>,
  ) {
    const result = await this.postsService.getById({
      id,
      userId: user?.userId,
    })

    if (!result) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    return await this.commentsService.getAllByPostId({
      postId: id,
      userId: user?.userId,
      query,
    })
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  private async createCommentById(
    @Param('id') id: string,
    @User() user: IJwtUser,
    @Body() body: BaseCommentDto,
  ) {
    const { userId, login } = user

    const result = await this.postsService.getById({
      id,
      userId,
    })

    if (!result) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    const { content } = body

    return await this.commentsService.create({
      postId: id,
      content,
      commentatorInfo: {
        userId,
        userLogin: login,
      },
    })
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updateLikeById(
    @Param('id') id: string,
    @User() user: IJwtUser,
    @Body() body: BasePostLikeDto,
  ) {
    const { likeStatus } = body
    const { userId, login } = user

    const result = await this.postsService.getById({
      id,
      userId,
    })

    if (!result) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    await this.postsService.updateLikeById({
      postId: id,
      user: {
        id: userId,
        login,
      },
      likeStatus,
    })
  }
}
