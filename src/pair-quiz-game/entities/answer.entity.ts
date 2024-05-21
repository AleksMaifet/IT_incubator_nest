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

  @Column('uuid')
  public questionId: string

  @ManyToOne(() => GameEntity)
  @JoinColumn()
  public game: GameEntity

  @Column()
  public body: string

  @Column()
  public answerStatus: ANSWER_STATUS_ENUM

  @CreateDateColumn()
  public addedAt: Date
}
