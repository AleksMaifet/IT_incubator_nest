import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

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

  @Column({ type: 'uuid' })
  userId: string
}
