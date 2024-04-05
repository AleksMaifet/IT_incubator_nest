import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { BlogPgEntity } from './blog.pg.entity.model'

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
}
