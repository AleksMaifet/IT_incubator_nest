import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

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

  @Column()
  likesCount: number

  @Column()
  dislikesCount: number
}
