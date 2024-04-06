import { MongooseModule } from '@nestjs/mongoose'
import { Module } from '@nestjs/common'
import { CqrsModule } from '@nestjs/cqrs'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SecurityDevicesService } from './security-devices.service'
import { SecurityDevicesController } from './security-devices.controller'
import {
  SecurityDevicesRepository,
  SecurityDevicesSqlRepository,
} from './repositories'
import {
  RefreshTokenMetaModel,
  RefreshTokenMetaPgEntity,
  RefreshTokenMetaSchema,
} from './models'
import {
  CreateRefreshTokenMetaUseCase,
  DeleteAllDevicesUseCase,
  DeleteDeviceByDeviceIdUseCase,
  DeleteRefreshTokenMetaUseCase,
  GetAllDevicesUseCase,
  GetDeviceByDeviceIdUseCase,
  GetRefreshTokenMetaUseCase,
  UpdateRefreshTokenMetaUseCase,
} from './useCases'

const useCases = [
  CreateRefreshTokenMetaUseCase,
  UpdateRefreshTokenMetaUseCase,
  GetRefreshTokenMetaUseCase,
  DeleteRefreshTokenMetaUseCase,
  GetAllDevicesUseCase,
  GetDeviceByDeviceIdUseCase,
  DeleteAllDevicesUseCase,
  DeleteDeviceByDeviceIdUseCase,
]

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: RefreshTokenMetaModel.name,
        schema: RefreshTokenMetaSchema,
      },
    ]),
    TypeOrmModule.forFeature([RefreshTokenMetaPgEntity]),
  ],
  controllers: [SecurityDevicesController],
  providers: [
    SecurityDevicesService,
    SecurityDevicesRepository,
    SecurityDevicesSqlRepository,
    ...useCases,
  ],
  exports: [SecurityDevicesService],
})
export class SecurityDevicesModule {}
