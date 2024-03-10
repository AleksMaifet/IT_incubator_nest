import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
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
import { GetPostsRequestQuery } from './interfaces'
import { BasePostLikeDto } from './dto'
import {
  GetAllPostsCommand,
  GetPostByIdCommand,
  UpdatePostLikeByIdCommand,
} from './useCases'
import { User, UUIDParam } from '../libs/decorators'
import { HttpRequestHeaderUserInterceptor } from '../libs/interceptors'
import { IJwtUser } from '../libs/interfaces'
import { JwtAuthGuard } from '../libs/guards'

@Controller('posts')
export class PostsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commandBus: CommandBus,
  ) {}

  @UseInterceptors(HttpRequestHeaderUserInterceptor)
  @Get()
  private async getAll(
    @Query() query: GetPostsRequestQuery<string>,
    @User() user: IJwtUser,
  ) {
    return await this.commandBus.execute(
      new GetAllPostsCommand({
        userId: user?.userId,
        query,
      }),
    )
  }

  @UseInterceptors(HttpRequestHeaderUserInterceptor)
  @Get(':id')
  private async getById(@UUIDParam('id') id: string, @User() user: IJwtUser) {
    const result = await this.commandBus.execute(
      new GetPostByIdCommand({
        id,
        userId: user?.userId,
      }),
    )

    if (!result) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    return result
  }

  // @UseGuards(BasicAuthGuard)
  // @Post()
  // private async create(@Body() body: CreatePostDto) {
  //   return await this.commandBus.execute(new CreatePostCommand(body))
  // }

  // @UseGuards(BasicAuthGuard)
  // @Put(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // private async updateById(
  //   @UUIDParam('id') id: string,
  //   @Body() body: UpdatePostDto,
  // ) {
  //   const result = await this.commandBus.execute(
  //     new UpdatePostByIdCommand({ id, dto: body }),
  //   )
  //
  //   if (!result) {
  //     throw new NotFoundException({ message: 'post is not exists' })
  //   }
  //
  //   return result
  // }

  // @UseGuards(BasicAuthGuard)
  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // private async deleteById(@UUIDParam('id') id: string) {
  //   const result = await this.commandBus.execute(new DeletePostByIdCommand(id))
  //
  //   if (!result) {
  //     throw new NotFoundException({ message: 'post is not exists' })
  //   }
  //
  //   return result
  // }

  @UseInterceptors(HttpRequestHeaderUserInterceptor)
  @Get(':id/comments')
  private async getAllCommentById(
    @UUIDParam('id') id: string,
    @User() user: IJwtUser,
    @Query() query: GetCommentsRequestQuery<string>,
  ) {
    const result = await this.commandBus.execute(
      new GetPostByIdCommand({
        id,
        userId: user?.userId,
      }),
    )

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
    @UUIDParam('id') id: string,
    @User() user: IJwtUser,
    @Body() body: BaseCommentDto,
  ) {
    const { userId, login } = user

    const result = await this.commandBus.execute(
      new GetPostByIdCommand({
        id,
        userId: user?.userId,
      }),
    )

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
    @UUIDParam('id') id: string,
    @User() user: IJwtUser,
    @Body() body: BasePostLikeDto,
  ) {
    const { likeStatus } = body
    const { userId, login } = user

    const result = await this.commandBus.execute(
      new GetPostByIdCommand({
        id,
        userId: user?.userId,
      }),
    )

    if (!result) {
      throw new NotFoundException({ message: 'post is not exists' })
    }

    await this.commandBus.execute(
      new UpdatePostLikeByIdCommand({
        postId: id,
        user: {
          id: userId,
          login,
        },
        likeStatus,
      }),
    )
  }
}
