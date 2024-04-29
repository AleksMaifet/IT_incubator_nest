import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import { QuizController } from './quiz.controller'
import { QuizRepository } from './quiz.repository'
import { QuizQuestionEntity } from './models'

@Module({
  imports: [TypeOrmModule.forFeature([QuizQuestionEntity])],
  controllers: [QuizController],
  providers: [QuizRepository],
})
export class QuizModule {}
