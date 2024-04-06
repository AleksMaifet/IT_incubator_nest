import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { PostPgEntity } from '../../posts/models/post.pg.entity.model'
import { UserPgEntity } from '../../users'

@Entity('comments')
export class CommentPgEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  content: string

  @Column()
  createdAt: Date

  @Column()
  likesCount: number

  @Column()
  dislikesCount: number

  @ManyToOne(() => PostPgEntity, (post) => post.comment)
  post: PostPgEntity

  @ManyToOne(() => UserPgEntity, (user) => user.comment)
  user: UserPgEntity
}
