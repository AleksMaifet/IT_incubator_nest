import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { LikesModule } from '../likes'
import { JwtService } from '../configs'
import { CommentsController } from './comments.controller'
import { CommentsRepository, CommentsSqlRepository } from './repositories'
import { CommentModel, CommentSchema, CommentPgEntity } from './models'
import {
  CreateCommentByPostIdUseCase,
  DeleteCommentByIdUseCase,
  GetAllCommentsByPostIdUseCase,
  GetCommentByIdUseCase,
  UpdateCommentByIdUseCase,
  UpdateCommentLikeByIdUseCase,
} from './useCases'

const useCases = [
  CreateCommentByPostIdUseCase,
  GetAllCommentsByPostIdUseCase,
  GetCommentByIdUseCase,
  UpdateCommentByIdUseCase,
  DeleteCommentByIdUseCase,
  UpdateCommentLikeByIdUseCase,
]

@Module({
  imports: [
    CqrsModule,
    LikesModule,
    MongooseModule.forFeature([
      {
        name: CommentModel.name,
        schema: CommentSchema,
      },
    ]),
    TypeOrmModule.forFeature([CommentPgEntity]),
  ],
  controllers: [CommentsController],
  providers: [
    CommentsRepository,
    CommentsSqlRepository,
    JwtService,
    Logger,
    ...useCases,
  ],
})
export class CommentsModule {}
