import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { IEmailConfirmation } from '../interfaces'

@Schema({
  versionKey: false,
  toJSON: {
    transform: function (_, ret) {
      delete ret._id
    },
  },
})
class ConfirmationModel extends Document implements IEmailConfirmation {
  @Prop({ required: true, default: () => new Types.ObjectId().toString() })
  id: string

  @Prop({ required: true })
  userId: string

  @Prop({ required: true })
  code: string

  @Prop({ required: true })
  expiresIn: Date

  @Prop({ required: true })
  isConfirmed: boolean
}

const ConfirmationSchema = SchemaFactory.createForClass(ConfirmationModel)

export { ConfirmationModel, ConfirmationSchema }
