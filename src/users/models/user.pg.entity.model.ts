import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ConfirmationPgEntity } from '../../auth/models/confirmation.pg.entity.model'
import { RefreshTokenMetaPgEntity } from '../../security-devices'
import { CommentPgEntity } from '../../comments/models/comment.pg.entity.model'

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
  confirmation: ConfirmationPgEntity[]

  @OneToMany(() => RefreshTokenMetaPgEntity, (confirm) => confirm.user)
  refreshTokenMeta: RefreshTokenMetaPgEntity[]

  @OneToMany(() => CommentPgEntity, (comment) => comment.user)
  comment: CommentPgEntity[]
}
