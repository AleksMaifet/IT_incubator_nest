import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { IJwtUser } from '../libs/interfaces'
import { AnswerDto } from './dto'
import { AnswerEntity, GameEntity, PlayerProgressEntity } from './entities'
import { GAME_STATUS_ENUM } from './interfaces'

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
  }: {
    game: GameEntity
    dto: AnswerDto
  }) {
    return await this.answerRepository.save({
      body: dto.answer,
      game,
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

    pendingGame.secondPlayerProgress = userProgress
    pendingGame.status = GAME_STATUS_ENUM.Active
    pendingGame.startGameDate = new Date()

    await this.gameRepository.save(pendingGame)

    return pendingGame
  }

  public async getActiveGameByUser(userId: string) {
    return await this.gameRepository.findOne({
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
      // relations: ['firstPlayerProgress.user', 'secondPlayerProgress.user'],
    })
  }
}
