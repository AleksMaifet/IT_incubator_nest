import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { AnswerDto } from './dto'
import { AnswerEntity, GameEntity, PlayerProgressEntity } from './entities'
import { ANSWER_STATUS_ENUM, GAME_STATUS_ENUM } from './interfaces'
import { MAX_AMOUNT_QUESTIONS } from './constants'

export class PairQuizGameRepository {
  constructor(
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
    @InjectRepository(GameEntity)
    private readonly gameRepository: Repository<GameEntity>,
    @InjectRepository(PlayerProgressEntity)
    private readonly playerProgressRepository: Repository<PlayerProgressEntity>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  public async createAnswer({
    game,
    dto,
    userId,
  }: {
    game: GameEntity
    dto: AnswerDto
    userId: string
  }) {
    const { answer } = dto

    const userAnswers = await this.getAllAnswersByUserId({
      userId,
      gameId: game.id,
    })

    const currentQuestion = game.questions[userAnswers.length]
    const defaultSaveEntity = {
      body: answer,
      game,
    }

    switch (true) {
      case !currentQuestion:
        return await this.answerRepository.save(defaultSaveEntity)
      case !currentQuestion.correctAnswers.includes(answer):
        return await this.answerRepository.save({
          ...defaultSaveEntity,
          answerStatus: ANSWER_STATUS_ENUM.Incorrect,
          questionId: currentQuestion.id,
        })
      default:
        return await this.answerRepository.save({
          ...defaultSaveEntity,
          answerStatus: ANSWER_STATUS_ENUM.Correct,
          questionId: currentQuestion.id,
        })
    }
  }

  public async joinOrCreateGame(userId: string) {
    const pendingGame = await this.gameRepository.findOne({
      where: {
        status: GAME_STATUS_ENUM.PendingSecondPlayer,
        secondPlayerProgress: null,
      },
      relations: ['firstPlayerProgress.user', 'secondPlayerProgress'],
    })

    if (pendingGame?.firstPlayerProgress.user.id === userId) {
      return null
    }

    let userProgress = await this.playerProgressRepository.findOneBy({
      user: { id: userId },
    })

    if (!userProgress) {
      const currentUser = await this.dataSource.query(
        `SELECT id, login FROM users
               WHERE id = $1`,
        [userId],
      )

      userProgress = await this.playerProgressRepository.save({
        user: currentUser[0],
      })
    }

    if (!pendingGame) {
      return await this.gameRepository.save({
        firstPlayerProgress: userProgress,
        secondPlayerProgress: null,
      })
    }

    const questions = await this.dataSource.query(
      `SELECT id, body, "correctAnswers" FROM "quizQuestions"
             WHERE published IS true
             ORDER BY RANDOM() LIMIT ${MAX_AMOUNT_QUESTIONS}`,
    )

    pendingGame.secondPlayerProgress = userProgress
    pendingGame.status = GAME_STATUS_ENUM.Active
    pendingGame.startGameDate = new Date()
    pendingGame.questions = questions

    await this.gameRepository.save(pendingGame)

    return pendingGame
  }

  public async getActiveGameByUserId(userId: string) {
    const game = await this.gameRepository.findOne({
      where: [
        {
          firstPlayerProgress: { user: { id: userId } },
          status: GAME_STATUS_ENUM.Active,
        },
        {
          secondPlayerProgress: { user: { id: userId } },
          status: GAME_STATUS_ENUM.Active,
        },
      ],
      relations: ['firstPlayerProgress', 'secondPlayerProgress'],
    })

    if (!game) return null

    // TODO pg doesn't create array in column => save as text by default
    const convertedQuestions = game.questions.map((q: any) => JSON.parse(q))

    return {
      ...game,
      questions: convertedQuestions,
    }
  }

  public async getAllAnswersByUserId({
    userId,
    gameId,
  }: {
    userId: string
    gameId: string
  }) {
    return await this.answerRepository.find({
      where: [
        {
          game: {
            id: gameId,
            firstPlayerProgress: { user: { id: userId } },
          },
        },
        {
          game: {
            id: gameId,
            secondPlayerProgress: { user: { id: userId } },
          },
        },
      ],
    })
  }
}
