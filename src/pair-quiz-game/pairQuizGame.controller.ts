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
import { PlayerProgressEntity } from './entities'
import { AnswerDto } from './dto'
import { ANSWER_STATUS_ENUM } from './interfaces'

@Controller('pair-game-quiz/pairs')
export class PairQuizGameController {
  constructor(
    private readonly pairQuizGameRepository: PairQuizGameRepository,
  ) {}

  private _mapPlayerProgress(playerProgress: PlayerProgressEntity) {
    if (!playerProgress) return playerProgress

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

  // TODO create 403 code
  @UseGuards(JwtAuthGuard)
  @Post('/my-current/answers')
  @HttpCode(HttpStatus.OK)
  private async createAnswers(@User() user: IJwtUser, @Body() dto: AnswerDto) {
    const activeGame = await this.pairQuizGameRepository.getActiveGameByUser(
      user.userId,
    )

    if (!activeGame) {
      throw new ForbiddenException()
    }

    const { id, addedAt } = await this.pairQuizGameRepository.createAnswer({
      dto,
      game: activeGame,
    })

    return {
      questionId: id,
      answerStatus: ANSWER_STATUS_ENUM.Correct,
      addedAt,
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/connection')
  @HttpCode(HttpStatus.OK)
  private async joinOrCreateGame(@User() user: IJwtUser) {
    const activeGame = await this.pairQuizGameRepository.getActiveGameByUser(
      user.userId,
    )

    if (activeGame) {
      throw new ForbiddenException()
    }

    const {
      id,
      firstPlayerProgress,
      secondPlayerProgress,
      status,
      questions,
      pairCreatedDate,
      startGameDate,
      finishGameDate,
    } = await this.pairQuizGameRepository.joinOrCreateGame(user)

    const mapGameQuestions = questions.map(({ id, body }) => ({ id, body }))

    return {
      id,
      firstPlayerProgress: this._mapPlayerProgress(firstPlayerProgress),
      secondPlayerProgress: this._mapPlayerProgress(secondPlayerProgress),
      questions: mapGameQuestions,
      status,
      pairCreatedDate,
      startGameDate,
      finishGameDate,
    }
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
}
