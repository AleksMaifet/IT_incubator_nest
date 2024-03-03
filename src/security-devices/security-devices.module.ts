import { MongooseModule } from '@nestjs/mongoose'
import { Module } from '@nestjs/common'
import { SecurityDevicesService } from './security-devices.service'
import { SecurityDevicesController } from './security-devices.controller'
import { SecurityDevicesRepository } from './security-devices.repository'
import { SecurityDevicesSqlRepository } from './security-devices.sql.repository'
import {
  RefreshTokenMetaModel,
  RefreshTokenMetaSchema,
} from './refresh-token-meta.model'

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: RefreshTokenMetaModel.name,
        schema: RefreshTokenMetaSchema,
      },
    ]),
  ],
  controllers: [SecurityDevicesController],
  providers: [
    SecurityDevicesService,
    SecurityDevicesRepository,
    SecurityDevicesSqlRepository,
  ],
  exports: [SecurityDevicesService],
})
export class SecurityDevicesModule {}
