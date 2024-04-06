import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { IUser } from '../interfaces'

@Schema({
  versionKey: false,
  toJSON: {
    transform: function (_, ret) {
      delete ret._id
    },
  },
})
class UserModel extends Document implements IUser {
  @Prop({ required: true, default: () => new Types.ObjectId().toString() })
  id: string

  @Prop({ required: true })
  login: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  passwordSalt: string

  @Prop({ required: true })
  passwordHash: string

  @Prop({ required: true })
  createdAt: Date
}

const UserSchema = SchemaFactory.createForClass(UserModel)

export { UserModel, UserSchema }
