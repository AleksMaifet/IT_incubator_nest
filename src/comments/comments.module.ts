import { Logger, Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CommentsService } from './comments.service'
import { CommentsController } from './comments.controller'
import { CommentsRepository } from './comments.repository'
import { CommentModel, CommentSchema } from './comment.model'
import { LikesModule } from '../likes'
import { JwtService } from '../configs'

@Module({
  imports: [
    LikesModule,
    MongooseModule.forFeature([
      {
        name: CommentModel.name,
        schema: CommentSchema,
      },
    ]),
  ],
  controllers: [CommentsController],
  providers: [CommentsService, CommentsRepository, JwtService, Logger],
  exports: [CommentsService],
})
export class CommentsModule {}
