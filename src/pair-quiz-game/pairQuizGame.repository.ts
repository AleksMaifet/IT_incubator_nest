import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { IJwtUser } from '../libs/interfaces'
import { AnswerDto } from './dto'
import { AnswerEntity, GameEntity, PlayerProgressEntity } from './entities'
import { ANSWER_STATUS_ENUM, GAME_STATUS_ENUM } from './interfaces'

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

    const userAnswers = await this.getAllAnswersByUser({
      userId,
      gameId: game.id,
    })

    const currentQuestion = game.questions[userAnswers.length]
    const answerStatus = currentQuestion.correctAnswers.includes(answer)
      ? ANSWER_STATUS_ENUM.Correct
      : ANSWER_STATUS_ENUM.Incorrect

    return await this.answerRepository.save({
      body: answer,
      game,
      answerStatus,
      questionId: currentQuestion.id,
    })
  }

  public async joinOrCreateGame(user: IJwtUser) {
    const { userId } = user

    const pendingGame = await this.gameRepository.findOne({
      where: {
        status: GAME_STATUS_ENUM.PendingSecondPlayer,
        secondPlayerProgress: null,
      },
      relations: ['firstPlayerProgress.user', 'secondPlayerProgress'],
    })

    if (pendingGame?.firstPlayerProgress.user.id === userId) {
      return pendingGame
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

    // WHERE published IS true

    const questions = await this.dataSource.query(
      `SELECT id, body, "correctAnswers" FROM "quizQuestions"
             ORDER BY RANDOM() LIMIT 5`,
    )

    pendingGame.secondPlayerProgress = userProgress
    pendingGame.status = GAME_STATUS_ENUM.Active
    pendingGame.startGameDate = new Date()
    pendingGame.questions = questions

    await this.gameRepository.save(pendingGame)

    return pendingGame
  }

  public async getActiveGameByUser(userId: string) {
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
    })

    if (!game) return null

    // TODO pg doesn't create array in column => save as text by default
    const convertedQuestions = game.questions.map((q: any) => JSON.parse(q))

    return {
      ...game,
      questions: convertedQuestions,
    }
  }

  public async getAllAnswersByUser({
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
