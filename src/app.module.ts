import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TestingModule } from './testing'
import { DatabaseModule } from './configs'

import { MongooseModule } from '@nestjs/mongoose'
import {
  CustomPostValidationByBlogId,
  PostModel,
  PostSchema,
  PostsController,
  PostsRepository,
  PostsService,
} from './posts'
import {
  BlogModel,
  BlogSchema,
  BlogsController,
  BlogsRepository,
  BlogsService,
} from './blogs'
import { CommentsModule } from './comments'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: BlogModel.name,
        schema: BlogSchema,
      },
      {
        name: PostModel.name,
        schema: PostSchema,
      },
    ]),
    AuthModule,
    UsersModule,
    TestingModule,
    CommentsModule,
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    BlogsService,
    BlogsRepository,
    PostsService,
    PostsRepository,
    CustomPostValidationByBlogId,
  ],
})
export class AppModule {}
