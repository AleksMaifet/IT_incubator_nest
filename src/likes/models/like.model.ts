import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { ILikes } from '../interfaces'
import { LIKE_POST_USER_STATUS_ENUM } from '../../posts'
import { LIKE_COMMENT_USER_STATUS_ENUM } from '../../comments'

@Schema({
  versionKey: false,
  toJSON: {
    transform: function (_, ret) {
      delete ret._id
    },
  },
})
class LikeModel extends Document implements ILikes {
  @Prop({ required: true, type: Object })
  likerInfo: {
    userId: string
    userLogin: string
  }

  @Prop({ required: true, type: Array })
  likeStatusComments: [
    {
      status: LIKE_COMMENT_USER_STATUS_ENUM
      commentId: string
      addedAt: Date
    },
  ]

  @Prop({ required: true, type: Array })
  likeStatusPosts: [
    {
      status: LIKE_POST_USER_STATUS_ENUM
      postId: string
      addedAt: Date
    },
  ]
}

const LikeSchema = SchemaFactory.createForClass(LikeModel)

export { LikeModel, LikeSchema }
