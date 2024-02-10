import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { IBlog } from './interfaces'

@Schema({
  versionKey: false,
  toJSON: {
    transform: function (_, ret) {
      delete ret._id
    },
  },
})
class BlogModel extends Document implements IBlog {
  @Prop({ required: true, default: () => new Types.ObjectId().toString() })
  id: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  description: string

  @Prop({ required: true })
  websiteUrl: string

  @Prop({ required: true })
  createdAt: Date

  @Prop({ required: true })
  isMembership: boolean
}

const BlogSchema = SchemaFactory.createForClass(BlogModel)

export { BlogModel, BlogSchema }
