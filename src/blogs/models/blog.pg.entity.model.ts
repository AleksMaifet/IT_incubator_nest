import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { PostPgEntity } from '../../posts/models/post.pg.entity.model'

@Entity('blogs')
export class BlogPgEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  description: string

  @Column()
  websiteUrl: string

  @Column()
  createdAt: Date

  @Column()
  isMembership: boolean

  @OneToMany(() => PostPgEntity, (post) => post.blog)
  post: PostPgEntity[]
}
