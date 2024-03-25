import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserModelEntity } from './user.pg.entity.model'

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

  @ManyToOne(() => UserModelEntity, (user) => user.confirmation)
  user: UserModelEntity
}
