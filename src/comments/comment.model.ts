import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { IComments, LIKE_COMMENT_USER_STATUS_ENUM } from './interfaces'

@Schema({
  versionKey: false,
  toJSON: {
    transform: function (_, ret) {
      delete ret._id
    },
  },
})
class CommentModel extends Document implements IComments {
  @Prop({ required: true, default: () => new Types.ObjectId().toString() })
  id: string

  @Prop({ required: true })
  postId: string

  @Prop({ required: true })
  content: string

  @Prop({ required: true, type: Object })
  commentatorInfo: {
    userId: string
    userLogin: string
  }

  @Prop({ required: true })
  createdAt: Date

  @Prop({ required: true, type: Object })
  likesInfo: {
    likesCount: number
    dislikesCount: number
    myStatus: LIKE_COMMENT_USER_STATUS_ENUM
  }
}

const CommentSchema = SchemaFactory.createForClass(CommentModel)

export { CommentModel, CommentSchema }
