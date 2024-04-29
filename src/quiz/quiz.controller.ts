import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  BaseQuizQuestionDto,
  GetQueryQuestionsDto,
  UpdatePublishQuizQuestionDto,
} from './dto'
import { QuizRepository } from './quiz.repository'
import { BasicAuthGuard } from '../libs/guards'
import { UUIDParam } from '../libs/decorators'

@Controller('sa/quiz/questions')
export class QuizController {
  constructor(private readonly quizRepository: QuizRepository) {}

  @UseGuards(BasicAuthGuard)
  @Post()
  private async createQuestion(@Body() dto: BaseQuizQuestionDto) {
    return await this.quizRepository.createQuestion(dto)
  }

  @UseGuards(BasicAuthGuard)
  @Get()
  private async findQuestions(@Query() query: GetQueryQuestionsDto) {
    return await this.quizRepository.getQuestions(query)
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updateQuestionById(
    @UUIDParam('id') id: string,
    @Body() dto: BaseQuizQuestionDto,
  ) {
    const result = await this.quizRepository.updateQuestionById({
      questionId: id,
      dto,
    })

    if (!result) {
      throw new NotFoundException({ message: 'quiz question is not exists' })
    }

    return result
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async updatePublishQuestionById(
    @UUIDParam('id') id: string,
    @Body() dto: UpdatePublishQuizQuestionDto,
  ) {
    const result = await this.quizRepository.updatePublishQuestionById({
      questionId: id,
      dto,
    })

    if (!result) {
      throw new NotFoundException({ message: 'quiz question is not exists' })
    }

    return result
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  private async deleteQuestionById(@UUIDParam('id') id: string) {
    const result = await this.quizRepository.deleteQuestionById(id)

    if (!result) {
      throw new NotFoundException({ message: 'quiz question is not exists' })
    }

    return result
  }
}
