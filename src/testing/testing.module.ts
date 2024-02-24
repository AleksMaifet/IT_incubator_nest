import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TestingController } from './testing.controller'
import { TestingRepository } from './testing.repository'
import { UserModel, UserSchema } from '../users'
import { BlogModel, BlogSchema } from '../blogs'
import { PostModel, PostSchema } from '../posts'
import { CommentModel, CommentSchema } from '../comments'
import { ConfirmationModel, ConfirmationSchema } from '../auth'
import { LikeModel, LikeSchema } from '../likes'
import {
  RefreshTokenMetaModel,
  RefreshTokenMetaSchema,
} from '../security-devices'

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
      {
        name: LikeModel.name,
        schema: LikeSchema,
      },
      {
        name: RefreshTokenMetaModel.name,
        schema: RefreshTokenMetaSchema,
      },
    ]),
  ],
  controllers: [TestingController],
  providers: [TestingRepository],
})
export class TestingModule {}
