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
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { PostsService } from './posts.service'
import { GetPostsRequestQuery } from './interfaces'
import { CreatePostDto, UpdatePostDto } from './dto'
import {
  BaseCommentDto,
  CommentsService,
  GetCommentsRequestQuery,
} from '../comments'
import { CreatePostCommand } from './useCases'
import { User } from '../libs/decorators'
import { BasicAuthGuard, JwtAuthGuard } from '../libs/guards'
import { IJwtUser } from '../libs/interfaces'

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
    private commandBus: CommandBus,
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

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  private async createCommentById(
    @Param('id') id: string,
    @User() user: IJwtUser,
    @Body() body: BaseCommentDto,
  ) {
    const { userId, login } = user

    const result = await this.postsService.getById(id)

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
}
