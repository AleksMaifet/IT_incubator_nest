import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { LIKE_COMMENT_USER_STATUS_ENUM } from '../../comments'

@Entity('commentLike')
export class CommentLikePgEntity {
  @PrimaryGeneratedColumn()
  _id: string

  @Column({ type: 'uuid' })
  commentId: string

  @Column({ type: 'uuid' })
  userId: string

  @Column()
  userLogin: string

  @Column({ nullable: true })
  status: LIKE_COMMENT_USER_STATUS_ENUM

  @Column({ nullable: true })
  addedAt: Date
}
