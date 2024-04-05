import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserPgEntity } from './user.pg.entity.model'

@Entity('confirmation')
export class ConfirmationPgEntity {
  @PrimaryGeneratedColumn()
  _id: string

  @Column({ type: 'uuid' })
  code: string

  @Column()
  expiresIn: Date

  @Column()
  isConfirmed: boolean

  @ManyToOne(() => UserPgEntity, (user) => user.confirmation)
  user: UserPgEntity
}
