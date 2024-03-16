import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CqrsModule } from '@nestjs/cqrs'
import { LikesModule } from '../likes'
import { JwtService } from '../configs'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { CommentsRepository, CommentsSqlRepository } from './repositories'
import { CommentModel, CommentSchema } from './comment.model'
import {
  CreateCommentByPostIdUseCase,
  DeleteCommentByIdUseCase,
  GetAllCommentsByPostIdUseCase,
  GetCommentByIdUseCase,
  UpdateCommentByIdUseCase,
} from './useCases'

const useCases = [
  CreateCommentByPostIdUseCase,
  GetAllCommentsByPostIdUseCase,
  GetCommentByIdUseCase,
  UpdateCommentByIdUseCase,
  DeleteCommentByIdUseCase,
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
    CommentsService,
    CommentsRepository,
    CommentsSqlRepository,
    JwtService,
    Logger,
    ...useCases,
  ],
  exports: [CommentsService],
})
export class CommentsModule {}
