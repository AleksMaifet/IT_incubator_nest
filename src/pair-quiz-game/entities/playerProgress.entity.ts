import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UserPgEntity } from '../../users'

@Entity('quizPlayerProgress')
export class PlayerProgressEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @OneToOne(() => UserPgEntity)
  @JoinColumn()
  public user: UserPgEntity

  @Column({ default: 0 })
  public score: number

  @Column({ default: 0 })
  public avgScores: number

  @Column({ default: 0 })
  public gamesCount: number

  @Column({ default: 0 })
  public winsCount: number

  @Column({ default: 0 })
  public lossesCount: number

  @Column({ default: 0 })
  public drawsCount: number
}
