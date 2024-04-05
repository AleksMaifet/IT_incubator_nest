import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ConfirmationPgEntity } from './confirmation.pg.entity.model'
import { RefreshTokenMetaPgEntity } from './refreshTokenMeta.pg.entity.model'

@Entity('users')
export class UserPgEntity {
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

  @OneToMany(() => ConfirmationPgEntity, (confirm) => confirm.user)
  confirmation: ConfirmationPgEntity

  @OneToMany(() => RefreshTokenMetaPgEntity, (confirm) => confirm.user)
  refreshTokenMeta: RefreshTokenMetaPgEntity
}
