import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

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

  @Column()
  likesCount: number

  @Column()
  dislikesCount: number
}
