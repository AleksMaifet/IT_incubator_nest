import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('quizQuestions')
export class QuizQuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string

  @Column({ nullable: true })
  public body: string

  @Column('json', { nullable: true })
  public correctAnswers: string[]

  @Column({ default: false })
  public published: boolean

  @CreateDateColumn({ nullable: true })
  public createdAt: string

  @Column({ nullable: true })
  public updatedAt: string
}
