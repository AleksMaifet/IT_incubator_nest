import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { PairQuizGameController } from './pairQuizGame.controller'
import { PairQuizGameRepository } from './pairQuizGame.repository'
import {
  AnswerEntity,
  GameEntity,
  PlayerProgressEntity,
  QuestionEntity,
} from './entities'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnswerEntity,
      GameEntity,
      PlayerProgressEntity,
      QuestionEntity,
    ]),
  ],
  controllers: [PairQuizGameController],
  providers: [PairQuizGameRepository],
})
export class PairQuizGameModule {}
