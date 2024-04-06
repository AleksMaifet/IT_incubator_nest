import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document } from 'mongoose'
import { IRefreshTokenMeta } from '../interface'

@Schema({
  versionKey: false,
  toJSON: {
    transform: function (_, ret) {
      delete ret._id
    },
  },
})
class RefreshTokenMetaModel extends Document implements IRefreshTokenMeta {
  @Prop({ required: true })
  issuedAt: Date

  @Prop({ required: true })
  expirationAt: Date

  @Prop({ required: true })
  deviceId: string

  @Prop({ required: true })
  clientIp: string

  @Prop({ required: true })
  deviceName: string

  @Prop({ required: true })
  userId: string
}

const RefreshTokenMetaSchema = SchemaFactory.createForClass(
  RefreshTokenMetaModel,
)

export { RefreshTokenMetaModel, RefreshTokenMetaSchema }
