import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('quizQuestion')
export class QuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  body: string

  @Column('text', { array: true })
  correctAnswers: string[]
}
