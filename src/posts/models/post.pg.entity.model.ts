import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BlogPgEntity } from '../../blogs/models/blog.pg.entity.model'
import { CommentPgEntity } from '../../comments/models/comment.pg.entity.model'

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

  @Column()
  createdAt: Date

  @Column()
  likesCount: number

  @Column()
  dislikesCount: number

  @ManyToOne(() => BlogPgEntity, (blog) => blog.post)
  blog: BlogPgEntity

  @OneToMany(() => CommentPgEntity, (comment) => comment.post)
  comment: CommentPgEntity[]
}
