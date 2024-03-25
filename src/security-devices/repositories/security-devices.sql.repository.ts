import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { IRefreshTokenMeta } from '../interface'
import { RefreshTokenMetaPgEntity } from '../../configs/postgres/entities'

@Injectable()
class SecurityDevicesSqlRepository {
  constructor(
    @InjectRepository(RefreshTokenMetaPgEntity)
    private readonly repository: Repository<RefreshTokenMetaPgEntity>,
  ) {}

  public async updateRefreshTokenMeta(
    dto: Pick<
      IRefreshTokenMeta,
      'userId' | 'deviceId' | 'expirationAt' | 'issuedAt'
    >,
  ) {
    const { userId, deviceId, expirationAt, issuedAt } = dto

    const result = await this.repository.update(
      { user: { id: userId }, deviceId },
      { expirationAt, issuedAt },
    )

    return result.affected
  }

  public async createRefreshTokenMeta(dto: IRefreshTokenMeta) {
    const { issuedAt, expirationAt, deviceId, clientIp, deviceName, userId } =
      dto

    return await this.repository.save({
      issuedAt,
      expirationAt,
      deviceId,
      clientIp,
      deviceName,
      user: { id: userId },
    })
  }

  public async getRefreshTokenMeta(
    dto: Pick<
      IRefreshTokenMeta,
      'userId' | 'deviceId' | 'issuedAt' | 'expirationAt'
    >,
  ) {
    const { userId, deviceId, issuedAt, expirationAt } = dto

    return await this.repository.findOneBy({
      user: { id: userId },
      deviceId,
      issuedAt,
      expirationAt,
    })
  }

  public async deleteRefreshTokenMeta(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {
    const { userId, deviceId } = dto

    const result = await this.repository.delete({
      user: { id: userId },
      deviceId,
    })

    return result.affected
  }

  public async getAllDevices(userId: string) {
    return await this.repository
      .createQueryBuilder('r')
      .select('r.clientIp', 'ip')
      .addSelect('r.deviceName', 'title')
      .addSelect('r.issuedAt', 'lastActiveDate')
      .addSelect('r.deviceId', 'deviceId')
      .where('r.user.id = :userId', { userId })
      .getRawMany()
  }

  public async getDeviceByDeviceId(deviceId: string) {
    return await this.repository
      .createQueryBuilder('r')
      .leftJoin('r.user', 'u')
      .select('r.clientIp', 'ip')
      .addSelect('u.id', 'userId')
      .addSelect('r.deviceName', 'title')
      .addSelect('r.issuedAt', 'lastActiveDate')
      .addSelect('r.deviceId', 'deviceId')
      .where('r.deviceId = :deviceId', { deviceId })
      .getRawOne()
  }

  public async deleteAllDevices(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {
    const { userId, deviceId } = dto

    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('deviceId <> :deviceId', { deviceId })
      .execute()

    return result.affected
  }

  public async deleteDeviceByDeviceId(id: string) {
    const result = await this.repository.delete({
      deviceId: id,
    })

    return result.affected
  }
}

export { SecurityDevicesSqlRepository }
