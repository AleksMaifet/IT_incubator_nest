import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import {
  IEmailConfirmation,
  IPasswordRecoveryConfirmation,
} from '../interfaces'

class AuthSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async createEmailConfirmation(dto: IEmailConfirmation) {
    const query = `
    INSERT INTO confirmation ("userId", code, "expiresIn", "isConfirmed")
    VALUES ($1, $2, $3, $4)
    `

    return await this.dataSource.query(query, Object.values(dto))
  }

  public async passwordRecoveryConfirmation(
    dto: IPasswordRecoveryConfirmation,
  ) {
    const query = `
    INSERT INTO confirmation ("userId", code, "expiresIn", "isConfirmed")
    VALUES ($1, $2, $3, $4)
    ON CONFLICT ("userId")
    DO UPDATE SET code = EXCLUDED.code, "expiresIn" = EXCLUDED."expiresIn", "isConfirmed" = EXCLUDED."isConfirmed"
    RETURNING *
    `

    const result = await this.dataSource.query(query, Object.values(dto))

    return result[0]
  }

  public async deleteConfirmationByCodeORUserId(codeOrUserId: string) {
    const result = await this.dataSource.query(
      `
     DELETE from confirmation
     WHERE code = $1 OR "userId" = $1
    `,
      [codeOrUserId],
    )

    return result[1]
  }

  public async getConfirmationByCodeOrUserId(codeOrUserId: string) {
    const result = await this.dataSource.query(
      `
      SELECT * from confirmation
      WHERE code = $1 OR "userId" = $1
    `,
      [codeOrUserId],
    )

    return result[0]
  }

  public async updateEmailConfirmationCode(userId: string) {
    const query = `
       UPDATE confirmation
       SET code = $2
       WHERE "userId" = $1
       RETURNING *`

    const result = await this.dataSource.query(query, [userId, uuidv4()])

    return result[0][0]
  }
}

export { AuthSqlRepository }
