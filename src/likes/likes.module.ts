import { MongooseModule } from '@nestjs/mongoose'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Module } from '@nestjs/common'
import {
  LikeModel,
  LikeSchema,
  CommentLikePgEntity,
  PostLikePgEntity,
} from './models'
import { LikesRepository, LikesSqlRepository } from './repositories'

const TypeOrmFeatures = TypeOrmModule.forFeature([
  PostLikePgEntity,
  CommentLikePgEntity,
])

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: LikeModel.name,
        schema: LikeSchema,
      },
    ]),
    TypeOrmFeatures,
  ],
  providers: [LikesRepository, LikesSqlRepository],
  exports: [LikesRepository, LikesSqlRepository, TypeOrmFeatures],
})
export class LikesModule {}
