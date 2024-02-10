import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { CommentsRepository } from './comments.repository'
import { CommentModel, CommentSchema } from './comment.model'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: CommentModel.name,
        schema: CommentSchema,
      },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository],
  exports: [CommentsService],
})
export class CommentsModule {}
