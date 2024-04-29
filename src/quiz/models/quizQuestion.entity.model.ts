import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @UpdateDateColumn({ nullable: true })
  updatedAt: string
}
