import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { UserModelEntity } from './user.pg.entity.model'

@Entity('refreshTokenMeta')
export class RefreshTokenMetaPgEntity {
  @PrimaryGeneratedColumn()
  _id: string

  @Column()
  clientIp: string

  @Column({ type: 'uuid' })
  deviceId: string

  @Column()
  deviceName: string

  @Column()
  expirationAt: Date

  @Column()
  issuedAt: Date

  @ManyToOne(() => UserModelEntity, (user) => user.confirmation)
  user: UserModelEntity
}
