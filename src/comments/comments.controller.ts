import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
} from '@nestjs/common'
import { CommentsService } from './comments.service'
import { BaseCommentDto } from './dto'

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  private async getById(@Param('id') id: string) {
    const result = await this.commentsService.getById(id)

    if (!result) {
      throw new NotFoundException({ message: 'comment is not exists' })
    }

    return result
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updateById(
    @Param('id') id: string,
    @Body() body: BaseCommentDto,
  ) {
    const { content } = body

    const result = await this.commentsService.updateById({ id, content })

    if (!result) {
      throw new NotFoundException({ message: 'comment is not exists' })
    }

    return result
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteById(@Param('id') id: string) {
    const result = await this.commentsService.deleteById(id)

    if (!result) {
      throw new NotFoundException({ message: 'comment is not exists' })
    }

    return result
  }
}
