import { InjectModel } from '@nestjs/mongoose'
import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { IRefreshTokenMeta } from '../interface'
import { RefreshTokenMetaModel } from '../refresh-token-meta.model'

@Injectable()
class SecurityDevicesRepository {
  constructor(
    @InjectModel(RefreshTokenMetaModel.name)
    private readonly refreshTokenMetaModel: Model<RefreshTokenMetaModel>,
  ) {}

  private _mapGenerateDeviceResponse = (dto: IRefreshTokenMeta) => {
    const { clientIp, deviceName, deviceId, issuedAt } = dto

    return {
      ip: clientIp,
      title: deviceName,
      lastActiveDate: issuedAt,
      deviceId,
    }
  }

  public async updateRefreshTokenMeta(
    dto: Pick<
      IRefreshTokenMeta,
      'userId' | 'deviceId' | 'expirationAt' | 'issuedAt'
    >,
  ) {
    const { userId, deviceId } = dto

    return await this.refreshTokenMetaModel
      .updateOne({ userId, deviceId }, dto)
      .exec()
  }

  public async createRefreshTokenMeta(dto: IRefreshTokenMeta) {
    return await this.refreshTokenMetaModel.create(dto)
  }

  public async getRefreshTokenMeta(
    dto: Pick<
      IRefreshTokenMeta,
      'userId' | 'deviceId' | 'issuedAt' | 'expirationAt'
    >,
  ) {
    const { userId, deviceId, issuedAt, expirationAt } = dto

    return await this.refreshTokenMetaModel
      .findOne({ userId, deviceId, issuedAt, expirationAt })
      .exec()
  }

  public async deleteRefreshTokenMeta(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {
    const { userId, deviceId } = dto

    return await this.refreshTokenMetaModel
      .deleteOne({ userId, deviceId })
      .exec()
  }

  public async getAllDevices(userId: string) {
    const devices = await this.refreshTokenMetaModel.find({ userId }).exec()

    return devices.map(this._mapGenerateDeviceResponse)
  }

  public async getDeviceByDeviceId(deviceId: string) {
    return await this.refreshTokenMetaModel.findOne({ deviceId }).exec()
  }

  public async deleteAllDevices(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {
    const { userId, deviceId } = dto

    return await this.refreshTokenMetaModel
      .deleteMany({ userId, deviceId: { $ne: deviceId } })
      .exec()
  }

  public async deleteDeviceByDeviceId(id: string) {
    return await this.refreshTokenMetaModel.deleteOne({ deviceId: id }).exec()
  }
}

export { SecurityDevicesRepository }
