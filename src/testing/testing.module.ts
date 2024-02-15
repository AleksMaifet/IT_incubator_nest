import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TestingController } from './testing.controller'
import { TestingRepository } from './testing.repository'
import { UserModel, UserSchema } from '../users'
import { BlogModel, BlogSchema } from '../blogs'
import { PostModel, PostSchema } from '../posts'
import { CommentModel, CommentSchema } from '../comments'
import { ConfirmationModel, ConfirmationSchema } from '../auth'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: UserModel.name,
        schema: UserSchema,
      },
      {
        name: BlogModel.name,
        schema: BlogSchema,
      },
      {
        name: PostModel.name,
        schema: PostSchema,
      },
      {
        name: CommentModel.name,
        schema: CommentSchema,
      },
      {
        name: ConfirmationModel.name,
        schema: ConfirmationSchema,
      },
    ]),
  ],
  controllers: [TestingController],
  providers: [TestingRepository],
})
export class TestingModule {}
