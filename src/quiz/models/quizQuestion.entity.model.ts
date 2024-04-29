import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('quizQuestions')
export class QuizQuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ nullable: true })
  body: string

  @Column('json', { nullable: true })
  correctAnswers: string[]

  @Column({ default: false })
  published: boolean

  @CreateDateColumn({ nullable: true })
  createdAt: string

  @Column({ nullable: true })
  updatedAt: string
}
