import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../libs/guards'
import { User, UUIDParam } from '../libs/decorators'
import { IJwtUser } from '../libs/interfaces'
import { HttpRequestHeaderUserInterceptor } from '../libs/interceptors'
import { CommentsService } from './comments.service'
import { BaseCommentDto, BaseCommentLikeDto } from './dto'
import {
  DeleteCommentByIdCommand,
  GetCommentByIdCommand,
  UpdateCommentByIdCommand,
} from './useCases'

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly commandBus: CommandBus,
  ) {}

  @UseInterceptors(HttpRequestHeaderUserInterceptor)
  @Get(':id')
  private async getById(@UUIDParam('id') id: string, @User() user: IJwtUser) {
    const comment = await this.commandBus.execute(
      new GetCommentByIdCommand({
        id,
        userId: user?.userId,
      }),
    )

    if (!comment) {
      throw new NotFoundException({ message: 'comment is not exists' })
    }

    return comment
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updateById(
    @UUIDParam('id') id: string,
    @User() user: IJwtUser,
    @Body() body: BaseCommentDto,
  ) {
    const { content } = body
    const { userId } = user

    const comment = await this.commandBus.execute(
      new GetCommentByIdCommand({ id, userId }),
    )

    if (!comment) {
      throw new NotFoundException({ message: 'comment is not exists' })
    }

    if (userId !== comment?.commentatorInfo.userId) {
      throw new ForbiddenException()
    }

    return await this.commandBus.execute(
      new UpdateCommentByIdCommand({ id, content }),
    )
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteById(
    @UUIDParam('id') id: string,
    @User() user: IJwtUser,
  ) {
    const { userId } = user

    const comment = await this.commandBus.execute(
      new GetCommentByIdCommand({ id, userId }),
    )

    if (!comment) {
      throw new NotFoundException({ message: 'comment is not exists' })
    }

    if (userId !== comment?.commentatorInfo.userId) {
      throw new ForbiddenException()
    }

    return await this.commandBus.execute(new DeleteCommentByIdCommand(id))
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updateLikeById(
    @UUIDParam('id') id: string,
    @User() user: IJwtUser,
    @Body() body: BaseCommentLikeDto,
  ) {
    const { userId, login } = user
    const { likeStatus } = body

    const comment = await this.commandBus.execute(
      new GetCommentByIdCommand({ id, userId }),
    )

    if (!comment) {
      throw new NotFoundException({ message: 'comment is not exists' })
    }

    return await this.commentsService.updateLikeById({
      commentId: id,
      user: {
        id: userId,
        login,
      },
      likeStatus,
    })
  }
}
