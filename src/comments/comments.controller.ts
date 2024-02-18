import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common'
import { CommentsService } from './comments.service'
import { BaseCommentDto } from './dto'
import { JwtAuthGuard } from '../libs/guards'
import { User } from '../libs/decorators'
import { IJwtUser } from '../libs/interfaces'

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  private async getById(@Param('id') id: string, @User() user: IJwtUser) {
    const result = await this.commentsService.getById({
      id,
      userId: user?.userId,
    })

    if (!result) {
      throw new NotFoundException({ message: 'comment is not exists' })
    }

    return result
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updateById(
    @Param('id') id: string,
    @User() user: IJwtUser,
    @Body() body: BaseCommentDto,
  ) {
    const { content } = body
    const { userId } = user

    const comment = await this.commentsService.getById({ id, userId })

    if (!comment) {
      throw new NotFoundException({ message: 'comment is not exists' })
    }

    if (userId !== comment?.commentatorInfo.userId) {
      throw new ForbiddenException()
    }

    return await this.commentsService.updateById({ id, content })
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteById(@Param('id') id: string, @User() user: IJwtUser) {
    const { userId } = user

    const comment = await this.commentsService.getById({ id, userId })

    if (!comment) {
      throw new NotFoundException({ message: 'comment is not exists' })
    }

    if (userId !== comment?.commentatorInfo.userId) {
      throw new ForbiddenException()
    }

    return await this.commentsService.deleteById(id)
  }
}
