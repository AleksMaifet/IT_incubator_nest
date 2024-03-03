import { Column, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm'

@Entity('users')
export class UserModelEntity {
  @PrimaryGeneratedColumn()
  _id: string

  @Column()
  login: string

  @Column()
  email: string

  @Column()
  passwordSalt: string

  @Column()
  passwordHash: string

  @Column()
  createdAt: Date

  @Column({
    type: 'uuid',
    unique: true,
  })
  @Generated('uuid')
  id: string
}
