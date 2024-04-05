import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { v4 as uuidv4 } from 'uuid'
import {
  IEmailConfirmation,
  IPasswordRecoveryConfirmation,
} from '../interfaces'
import { ConfirmationPgEntity } from '../../configs/postgres/entities'

class AuthSqlRepository {
  constructor(
    @InjectRepository(ConfirmationPgEntity)
    private readonly repository: Repository<ConfirmationPgEntity>,
  ) {}

  public async createEmailConfirmation(dto: IEmailConfirmation) {
    const { userId, code, expiresIn, isConfirmed } = dto

    return await this.repository.save({
      code,
      expiresIn,
      isConfirmed,
      user: { id: userId },
    })
  }

  public async passwordRecoveryConfirmation(
    dto: IPasswordRecoveryConfirmation,
  ) {
    const { userId, code, expiresIn, isConfirmed } = dto

    const result = await this.repository.findOneBy({ user: { id: userId } })

    if (!result) {
      return await this.repository.save({
        code,
        expiresIn,
        isConfirmed,
        user: { id: userId },
      })
    }

    return true
  }

  public async deleteConfirmationByCodeORUserId(codeOrUserId: string) {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('code = :codeOrUserId', { codeOrUserId })
      .orWhere('userId = :codeOrUserId', { codeOrUserId })
      .execute()

    return result.affected
  }

  public async getConfirmationByCodeOrUserId(codeOrUserId: string) {
    return await this.repository
      .createQueryBuilder('c')
      .leftJoin('c.user', 'u')
      .addSelect('u.id')
      .where('c.code = :codeOrUserId', { codeOrUserId })
      .orWhere('u.id = :codeOrUserId', { codeOrUserId })
      .getOne()
  }

  public async updateEmailConfirmationCode(userId: string) {
    const result = await this.repository
      .createQueryBuilder()
      .update()
      .set({ code: uuidv4() })
      .where('userId = :userId', { userId })
      .returning('code')
      .execute()

    return result.raw[0]
  }
}

export { AuthSqlRepository }
