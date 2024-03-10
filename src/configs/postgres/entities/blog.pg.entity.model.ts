import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

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
}
