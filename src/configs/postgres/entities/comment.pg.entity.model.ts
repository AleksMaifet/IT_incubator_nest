import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { LIKE_COMMENT_USER_STATUS_ENUM } from '../../../comments'

@Entity('comments')
export class CommentPgEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  postId: string

  @Column()
  content: string

  @Column()
  userId: string

  @Column()
  userLogin: string

  @Column()
  createdAt: Date

  @Column({ type: 'jsonb' })
  likesInfo: {
    likesCount: number
    dislikesCount: number
    myStatus: LIKE_COMMENT_USER_STATUS_ENUM
  }
}
