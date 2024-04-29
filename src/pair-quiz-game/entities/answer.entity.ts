import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { GameEntity } from './game.entity'

@Entity('quizAnswers')
export class AnswerEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @ManyToOne(() => GameEntity)
  @JoinColumn()
  public game: GameEntity

  @Column()
  public body: string

  @CreateDateColumn()
  public addedAt: Date
}
