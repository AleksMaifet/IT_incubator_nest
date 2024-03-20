import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { LIKE_POST_USER_STATUS_ENUM } from '../../../posts'

@Entity('postLike')
export class PostLikePgEntity {
  @PrimaryGeneratedColumn()
  _id: string

  @Column({ type: 'uuid' })
  postId: string

  @Column({ type: 'uuid' })
  userId: string

  @Column()
  userLogin: string

  @Column({ nullable: true })
  status: LIKE_POST_USER_STATUS_ENUM

  @Column({ nullable: true })
  addedAt: Date
}
