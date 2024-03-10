import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IUserPostLike, LIKE_POST_USER_STATUS_ENUM } from '../../../posts'

@Entity('posts')
export class PostPgEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column()
  shortDescription: string

  @Column()
  content: string

  @Column({ type: 'uuid' })
  blogId: string

  @Column()
  blogName: string

  @Column()
  createdAt: Date

  @Column({ type: 'jsonb' })
  extendedLikesInfo: {
    likesCount: number
    dislikesCount: number
    myStatus: LIKE_POST_USER_STATUS_ENUM
    newestLikes: IUserPostLike[]
  }
}
