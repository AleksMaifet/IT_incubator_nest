import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { GameEntity } from './game.entity'
import { ANSWER_STATUS_ENUM } from '../interfaces'

@Entity('quizAnswers')
export class AnswerEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column('uuid', { default: null })
  public questionId: string

  @ManyToOne(() => GameEntity)
  @JoinColumn()
  public game: GameEntity

  @Column()
  public body: string

  @Column({ default: ANSWER_STATUS_ENUM.Incorrect })
  public answerStatus: ANSWER_STATUS_ENUM

  @CreateDateColumn()
  public addedAt: Date
}
