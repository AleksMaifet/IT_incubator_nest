import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../libs/guards'
import { User } from '../libs/decorators'
import { IJwtUser } from '../libs/interfaces'
import { PairQuizGameRepository } from './pairQuizGame.repository'
import {
  AnswerEntity,
  GameEntity,
  PlayerProgressEntity,
  QuestionEntity,
} from './entities'
import { AnswerDto } from './dto'
import { MAX_AMOUNT_QUESTIONS } from './constants'

@Controller('pair-game-quiz/pairs')
export class PairQuizGameController {
  constructor(
    private readonly pairQuizGameRepository: PairQuizGameRepository,
  ) {}

  // TODO create 403 code
  @UseGuards(JwtAuthGuard)
  @Post('/my-current/answers')
  @HttpCode(HttpStatus.OK)
  private async createAnswers(@User() user: IJwtUser, @Body() dto: AnswerDto) {
    const { userId } = user

    const activeGame =
      await this.pairQuizGameRepository.getActiveGameByUserId(userId)

    if (!activeGame) {
      throw new ForbiddenException()
    }

    const userAnswers = await this.pairQuizGameRepository.getAllAnswersByUserId(
      { userId, gameId: activeGame.id },
    )

    console.log(userAnswers)
    console.log(userAnswers.length)

    if (userAnswers.length > MAX_AMOUNT_QUESTIONS - 1) {
      throw new ForbiddenException()
    }

    const answer = await this.pairQuizGameRepository.createAnswer({
      dto,
      game: activeGame,
      userId,
    })

    return PairQuizGameController.answerViewModel(answer)
  }

  @UseGuards(JwtAuthGuard)
  @Post('/connection')
  @HttpCode(HttpStatus.OK)
  private async joinOrCreateGame(@User() user: IJwtUser) {
    const { userId } = user

    const activeGame =
      await this.pairQuizGameRepository.getActiveGameByUserId(userId)

    if (activeGame) {
      throw new ForbiddenException()
    }

    const game = await this.pairQuizGameRepository.joinOrCreateGame(userId)

    if (!game) {
      throw new ForbiddenException()
    }

    return PairQuizGameController.pairConnectionViewModel(game)
  }

  // @Get()
  // findAll() {
  //   return this.pairQuizGameRepository.findAll()
  // }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.pairQuizGameRepository.findOne(+id)
  // }
  //
  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updatePairQuizGameDto: UpdatePairQuizGameDto,
  // ) {
  //   return this.pairQuizGameRepository.update(+id, updatePairQuizGameDto)
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.pairQuizGameRepository.remove(+id)
  // }

  static playerProgressViewModel(playerProgress: PlayerProgressEntity) {
    if (!playerProgress) return null

    const { score, user } = playerProgress
    const { id, login } = user

    return {
      answers: [],
      player: {
        id,
        login,
      },
      score,
    }
  }

  static answerViewModel(answer: AnswerEntity) {
    const { questionId, answerStatus, addedAt } = answer

    return {
      questionId,
      answerStatus,
      addedAt,
    }
  }

  static questionsViewMode(questions: QuestionEntity[]) {
    if (!questions) return null

    return questions.map(({ id, body }) => ({ id, body }))
  }

  static pairConnectionViewModel(dto: GameEntity) {
    const {
      id,
      firstPlayerProgress,
      secondPlayerProgress,
      status,
      questions,
      pairCreatedDate,
      startGameDate,
      finishGameDate,
    } = dto

    return {
      id,
      firstPlayerProgress:
        PairQuizGameController.playerProgressViewModel(firstPlayerProgress),
      secondPlayerProgress:
        PairQuizGameController.playerProgressViewModel(secondPlayerProgress),
      questions: PairQuizGameController.questionsViewMode(questions),
      status,
      pairCreatedDate,
      startGameDate,
      finishGameDate,
    }
  }
}
