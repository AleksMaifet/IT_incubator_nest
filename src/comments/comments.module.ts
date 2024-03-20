import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CqrsModule } from '@nestjs/cqrs'
import { LikesModule } from '../likes'
import { JwtService } from '../configs'
import { CommentsController } from './comments.controller'
import { CommentsRepository, CommentsSqlRepository } from './repositories'
import { CommentModel, CommentSchema } from './comment.model'
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
