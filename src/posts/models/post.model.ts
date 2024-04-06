import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { IPost, IUserPostLike, LIKE_POST_USER_STATUS_ENUM } from '../interfaces'

@Schema({
  versionKey: false,
  toJSON: {
    transform: function (_, ret) {
      delete ret._id
    },
  },
})
class PostModel extends Document implements IPost {
  @Prop({ required: true, default: () => new Types.ObjectId().toString() })
  id: string

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  shortDescription: string

  @Prop({ required: true })
  content: string

  @Prop({ required: true })
  blogId: string

  @Prop({ required: true })
  blogName: string

  @Prop({ required: true })
  createdAt: Date

  @Prop({ required: true, type: Object })
  extendedLikesInfo: {
    likesCount: number
    dislikesCount: number
    myStatus: LIKE_POST_USER_STATUS_ENUM
    newestLikes: IUserPostLike[]
  }
}

const PostSchema = SchemaFactory.createForClass(PostModel)

export { PostModel, PostSchema }
