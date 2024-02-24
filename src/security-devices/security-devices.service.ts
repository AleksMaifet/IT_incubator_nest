import { Injectable } from '@nestjs/common'
import { SecurityDevicesRepository } from './security-devices.repository'
import { IRefreshTokenMeta } from './interface'

@Injectable()
export class SecurityDevicesService {
  constructor(
    private readonly securityDevicesRepository: SecurityDevicesRepository,
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

    return await this.securityDevicesRepository.createRefreshTokenMeta({
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

    return await this.securityDevicesRepository.updateRefreshTokenMeta({
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

    return await this.securityDevicesRepository.getRefreshTokenMeta({
      userId,
      deviceId,
      issuedAt: iat,
      expirationAt: exp,
    })
  }

  public async deleteRefreshTokenMeta(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {
    return await this.securityDevicesRepository.deleteRefreshTokenMeta(dto)
  }

  public async deleteExpiredRefreshToken() {
    return await this.securityDevicesRepository.deleteExpiredRefreshToken()
  }

  public async getAllDevices(id: string) {
    return await this.securityDevicesRepository.getAllDevices(id)
  }

  public async getDeviceByDeviceId(id: string) {
    return await this.securityDevicesRepository.getDeviceByDeviceId(id)
  }

  public async deleteAllDevices(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {
    return await this.securityDevicesRepository.deleteAllDevices(dto)
  }

  public async deleteDeviceByDeviceId(id: string) {
    return await this.securityDevicesRepository.deleteDeviceByDeviceId(id)
  }
}
