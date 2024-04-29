import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { GAME_STATUS_ENUM } from '../interfaces'
import { PlayerProgressEntity } from './playerProgress.entity'
import { QuestionEntity } from './question.entity'

@Entity('quizGame')
export class GameEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @OneToOne(() => PlayerProgressEntity)
  @JoinColumn()
  public firstPlayerProgress: PlayerProgressEntity

  @OneToOne(() => PlayerProgressEntity, { nullable: true })
  @JoinColumn()
  public secondPlayerProgress: PlayerProgressEntity

  @Column('text', { array: true, default: [] })
  public questions: QuestionEntity[]

  @Column({ default: GAME_STATUS_ENUM.PendingSecondPlayer })
  public status: GAME_STATUS_ENUM

  @CreateDateColumn()
  public pairCreatedDate: Date

  @Column({ default: null })
  public startGameDate: Date

  @Column({ default: null })
  public finishGameDate: Date
}
