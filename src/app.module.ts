import { Logger, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TestingModule } from './testing'
import {
  JwtService,
  MongoDatabaseModule,
  PostgresDatabaseModule,
} from './configs'
import {
  CustomPostValidationByBlogId,
  PostModel,
  PostPgEntity,
  PostSchema,
  PostsController,
  PostsRepository,
  PostsService,
  PostsSqlRepository,
} from './posts'
import {
  BlogModel,
  BlogPgEntity,
  BlogSchema,
  BlogsController,
  BlogsRepository,
  BlogsSqlRepository,
  BlogsSupeAdminController,
  CustomBlogValidationParamById,
  CustomPostValidationParamById,
} from './blogs'
import { CommentsModule } from './comments'
import { AuthModule } from './auth'
import { UsersModule } from './users'
import { SecurityDevicesModule } from './security-devices'
import { LikesModule } from './likes'
import { QuizModule } from './quiz'
import { AccessTokenStrategy, BasicStrategy } from './libs/strategies'
import {
  CreateBlogUseCase,
  CreatePostByBlogIdUseCase,
  DeleteBlogByIdUseCase,
  GetAllBlogsUseCase,
  GetBlogByIdUseCase,
  GetPostsByBlogIdUseCase,
  UpdateBlogByIdUseCase,
} from './blogs/useCases'
import {
  CreatePostUseCase,
  DeletePostByIdUseCase,
  GetAllPostsUseCase,
  GetPostByIdUseCase,
  UpdatePostByIdUseCase,
  UpdatePostLikeByIdUseCase,
} from './posts/useCases'

const useCases = [
  GetPostsByBlogIdUseCase,
  CreatePostByBlogIdUseCase,
  CreateBlogUseCase,
  GetAllBlogsUseCase,
  GetBlogByIdUseCase,
  UpdateBlogByIdUseCase,
  DeleteBlogByIdUseCase,
  CreatePostUseCase,
  GetAllPostsUseCase,
  GetPostByIdUseCase,
  UpdatePostByIdUseCase,
  DeletePostByIdUseCase,
  UpdatePostLikeByIdUseCase,
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
    TypeOrmModule.forFeature([BlogPgEntity, PostPgEntity]),
    AuthModule,
    UsersModule,
    TestingModule,
    CommentsModule,
    LikesModule,
    SecurityDevicesModule,
    QuizModule,
  ],
  controllers: [BlogsController, BlogsSupeAdminController, PostsController],
  providers: [
    AccessTokenStrategy,
    BasicStrategy,
    BlogsRepository,
    BlogsSqlRepository,
    PostsService,
    PostsRepository,
    PostsSqlRepository,
    CustomBlogValidationParamById,
    CustomPostValidationParamById,
    CustomPostValidationByBlogId,
    Logger,
    JwtService,
    ...useCases,
  ],
})
export class AppModule {}
