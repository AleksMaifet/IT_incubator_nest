import { APP_PIPE } from '@nestjs/core'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { UsersModule } from './users'
import { TestingModule } from './testing'
import { DatabaseModule } from './configs'
import { ValidationPipe } from './libs/pipes'
import { MongooseModule } from '@nestjs/mongoose'
import {
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
import { IsBlogExist } from './libs/customValidations'
import { CommentsModule } from './comments'

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
    UsersModule,
    TestingModule,
    CommentsModule,
  ],
  controllers: [BlogsController, PostsController],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    BlogsService,
    BlogsRepository,
    PostsService,
    PostsRepository,
    {
      provide: 'BlogsRepository',
      useClass: BlogsRepository,
    },
    IsBlogExist,
  ],
})
export class AppModule {}
