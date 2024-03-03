import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('confirmation')
export class ConfirmationModelPgEntity {
  @PrimaryGeneratedColumn()
  _id: string

  @Column({ type: 'uuid' })
  code: string

  @Column()
  expiresIn: Date

  @Column()
  isConfirmed: boolean

  @Column({ type: 'uuid', unique: true })
  userId: string
}
