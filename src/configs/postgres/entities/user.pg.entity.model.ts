import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ConfirmationModelPgEntity } from './confirmation.pg.entity.model'
import { RefreshTokenMetaPgEntity } from './refreshTokenMeta.pg.entity.model'

@Entity('users')
export class UserModelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  login: string

  @Column()
  email: string

  @Column()
  passwordSalt: string

  @Column()
  passwordHash: string

  @Column()
  createdAt: Date

  @OneToMany(() => ConfirmationModelPgEntity, (confirm) => confirm.user)
  confirmation: ConfirmationModelPgEntity

  @OneToMany(() => RefreshTokenMetaPgEntity, (confirm) => confirm.user)
  refreshTokenMeta: RefreshTokenMetaPgEntity
}
