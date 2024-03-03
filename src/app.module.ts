import { Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { CqrsModule } from '@nestjs/cqrs'
import { TestingModule } from './testing'
import {
  MongoDatabaseModule,
  JwtService,
  PostgresDatabaseModule,
} from './configs'
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
import { LikesModule } from './likes'
import { SecurityDevicesModule } from './security-devices/security-devices.module'

const useCases = [
  GetPostsByBlogIdUseCase,
  CreatePostByBlogIdUseCase,
  CreatePostUseCase,
]

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongoDatabaseModule,
    PostgresDatabaseModule,
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
    LikesModule,
    SecurityDevicesModule,
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
    Logger,
    JwtService,
    ...useCases,
  ],
})
export class AppModule {}
