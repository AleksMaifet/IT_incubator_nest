import { MongooseModule } from '@nestjs/mongoose'
import { Module } from '@nestjs/common'
import { LikeModel, LikeSchema } from './like.model'
import { LikesRepository, LikesSqlRepository } from './repositories'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LikeModel.name,
        schema: LikeSchema,
      },
    ]),
  ],
  providers: [LikesRepository, LikesSqlRepository],
  exports: [LikesRepository, LikesSqlRepository],
})
export class LikesModule {}
