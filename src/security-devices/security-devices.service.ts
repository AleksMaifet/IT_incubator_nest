import { Injectable } from '@nestjs/common'
import { SecurityDevicesRepository } from './security-devices.repository'
import { IRefreshTokenMeta } from './interface'
import { SecurityDevicesSqlRepository } from './security-devices.sql.repository'

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
    private readonly securityDevicesSqlRepository: SecurityDevicesSqlRepository,
  ) {}

  private _mapTimeStampsToDB({
    issuedAt,
    expirationAt,
  }: {
    issuedAt: number
    expirationAt: number
  }) {
    const generateLocale = (value: number) => {
      return new Date(value * 1000)
    }

    return {
      iat: generateLocale(issuedAt),
      exp: generateLocale(expirationAt),
    }
  }

  public async createRefreshTokenMeta(
    dto: Pick<
      IRefreshTokenMeta,
      'userId' | 'deviceId' | 'deviceName' | 'clientIp'
    > & {
      issuedAt: number
      expirationAt: number
    },
  ) {
    const { userId, deviceId, issuedAt, expirationAt, deviceName, clientIp } =
      dto

    const timeSteps = this._mapTimeStampsToDB({ issuedAt, expirationAt })

    const { iat, exp } = timeSteps

    return await this.securityDevicesSqlRepository.createRefreshTokenMeta({
      userId,
      deviceId,
      issuedAt: iat,
      expirationAt: exp,
      deviceName,
      clientIp,
    })
  }

  public async updateRefreshTokenMeta(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'> & {
      issuedAt: number
      expirationAt: number
    },
  ) {
    const { userId, deviceId, issuedAt, expirationAt } = dto

    const timeSteps = this._mapTimeStampsToDB({ issuedAt, expirationAt })

    const { iat, exp } = timeSteps

    return await this.securityDevicesSqlRepository.updateRefreshTokenMeta({
      userId,
      deviceId,
      issuedAt: iat,
      expirationAt: exp,
    })
  }

  public async getRefreshTokenMeta(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'> & {
      issuedAt: number
      expirationAt: number
    },
  ) {
    const { userId, deviceId, issuedAt, expirationAt } = dto

    const timeSteps = this._mapTimeStampsToDB({ issuedAt, expirationAt })

    const { iat, exp } = timeSteps

    return await this.securityDevicesSqlRepository.getRefreshTokenMeta({
      userId,
      deviceId,
      issuedAt: iat,
      expirationAt: exp,
    })
  }

  public async deleteRefreshTokenMeta(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {
    return await this.securityDevicesSqlRepository.deleteRefreshTokenMeta(dto)
  }

  public async getAllDevices(id: string) {
    return await this.securityDevicesSqlRepository.getAllDevices(id)
  }

  public async getDeviceByDeviceId(id: string) {
    return await this.securityDevicesSqlRepository.getDeviceByDeviceId(id)
  }

  public async deleteAllDevices(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {
    return await this.securityDevicesSqlRepository.deleteAllDevices(dto)
  }

  public async deleteDeviceByDeviceId(id: string) {
    return await this.securityDevicesSqlRepository.deleteDeviceByDeviceId(id)
  }
}
