import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { IRefreshTokenMeta } from './interface'

@Injectable()
class SecurityDevicesSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async updateRefreshTokenMeta(
    dto: Pick<
      IRefreshTokenMeta,
      'userId' | 'deviceId' | 'expirationAt' | 'issuedAt'
    >,
  ) {
    const { userId, deviceId, expirationAt, issuedAt } = dto

    const query = `
       UPDATE 
        "refreshTokenMeta"
       SET 
        "expirationAt" = $3,
        "issuedAt" = $4
       WHERE 
        "userId" = $1 AND
        "deviceId" = $2
       RETURNING 
        *
       `

    const result = await this.dataSource.query(query, [
      userId,
      deviceId,
      expirationAt,
      issuedAt,
    ])

    return result[1]
  }

  public async createRefreshTokenMeta(dto: IRefreshTokenMeta) {
    return await this.dataSource.query(
      `
     INSERT INTO "refreshTokenMeta" ("userId", "deviceId", "issuedAt", "expirationAt", "deviceName", "clientIp")
     VALUES ($1, $2, $3, $4, $5, $6)
    `,
      Object.values(dto),
    )
  }

  public async getRefreshTokenMeta(
    dto: Pick<
      IRefreshTokenMeta,
      'userId' | 'deviceId' | 'issuedAt' | 'expirationAt'
    >,
  ) {
    const { userId, deviceId, issuedAt, expirationAt } = dto

    const query = `
    SELECT
       *
    FROM
        "refreshTokenMeta"
    WHERE
        "userId" = $1 AND
        "deviceId" = $2 AND
        "issuedAt" = $3 AND
        "expirationAt" = $4
    `

    const result = await this.dataSource.query(query, [
      userId,
      deviceId,
      issuedAt,
      expirationAt,
    ])

    return result.length
  }

  public async deleteRefreshTokenMeta(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {
    const { userId, deviceId } = dto

    const result = await this.dataSource.query(
      `
     DELETE 
     FROM 
        "refreshTokenMeta"
     WHERE 
        "userId" = $1 AND
        "deviceId" = $2
    `,
      [userId, deviceId],
    )

    return result[1]
  }

  public async getAllDevices(userId: string) {
    const query = `
    SELECT
        "clientIp" AS ip,
        "deviceName" AS title,
        "issuedAt" AS "lastActiveDate",
        "deviceId"
    FROM
        "refreshTokenMeta"
    WHERE
        "userId" = $1
    `

    return await this.dataSource.query(query, [userId])
  }

  public async getDeviceByDeviceId(deviceId: string) {
    const result = await this.dataSource.query(
      `
     SELECT 
        "userId",      
        "clientIp" AS ip,
        "deviceName" AS title,
        "issuedAt" AS "lastActiveDate",
        "deviceId"
     FROM
        "refreshTokenMeta"
     WHERE 
        "deviceId" = $1
    `,
      [deviceId],
    )

    return result[0]
  }

  public async deleteAllDevices(
    dto: Pick<IRefreshTokenMeta, 'userId' | 'deviceId'>,
  ) {
    const { userId, deviceId } = dto

    const result = await this.dataSource.query(
      `
      DELETE
      FROM
        "refreshTokenMeta"
      WHERE
        "userId" = $1 AND
        "deviceId" <> $2
    `,
      [userId, deviceId],
    )

    return result[1]
  }

  public async deleteDeviceByDeviceId(id: string) {
    const result = await this.dataSource.query(
      `
      DELETE
      FROM
        "refreshTokenMeta"
      WHERE
        "deviceId" = $1
    `,
      [id],
    )

    return result[1]
  }
}

export { SecurityDevicesSqlRepository }
