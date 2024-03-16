import { MongooseModule } from '@nestjs/mongoose'
import { Module } from '@nestjs/common'
import { LikesService } from './likes.service'
import { LikeModel, LikeSchema } from './like.model'
import { LikesRepository } from './repositories/likes.repository'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LikeModel.name,
        schema: LikeSchema,
      },
    ]),
  ],
  providers: [LikesService, LikesRepository],
  exports: [LikesService, LikesRepository],
})
export class LikesModule {}
