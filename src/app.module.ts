import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { CqrsModule } from '@nestjs/cqrs'
import { TestingModule } from './testing'
import { DatabaseModule } from './configs'
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
import { AccessTokenStrategy, BasicStrategy } from './libs/strategies'
import {
  CreatePostByBlogIdUseCase,
  GetPostsByBlogIdUseCase,
} from './blogs/useCases'
import { CreatePostUseCase } from './posts/useCases'

const useCases = [
  GetPostsByBlogIdUseCase,
  CreatePostByBlogIdUseCase,
  CreatePostUseCase,
]

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    CqrsModule,
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
    AccessTokenStrategy,
    BasicStrategy,
    BlogsService,
    BlogsRepository,
    PostsService,
    PostsRepository,
    CustomPostValidationByBlogId,
    ...useCases,
  ],
})
export class AppModule {}
