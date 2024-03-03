import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { IEmailConfirmation, IPasswordRecoveryConfirmation } from './interfaces'
import { ConfirmationModel } from './confirmation.model'

@Injectable()
class AuthRepository {
  constructor(
    @InjectModel(ConfirmationModel.name)
    private readonly confirmationModel: Model<ConfirmationModel>,
  ) {}

  public async createEmailConfirmation(dto: IEmailConfirmation) {
    return await this.confirmationModel.create(dto)
  }

  public async passwordRecoveryConfirmation(
    dto: IPasswordRecoveryConfirmation,
  ) {
    const { userId } = dto

    const result = await this.confirmationModel.findOneAndUpdate(
      { userId },
      dto,
    )

    if (!result) {
      return await this.confirmationModel.create(dto)
    }

    return result
  }

  public async deleteConfirmationByUserId(userId: string) {
    return await this.confirmationModel.deleteOne({ userId }).exec()
  }

  public async deleteEmailConfirmationByCode(code: string) {
    return await this.confirmationModel.deleteOne({ code }).exec()
  }

  public async getEmailConfirmationByCodeOrUserId(codeOrUserId: string) {
    return await this.confirmationModel
      .findOne({
        $or: [{ code: codeOrUserId }, { userId: codeOrUserId }],
      })
      .exec()
  }

  public async getPasswordRecoveryConfirmationByCode(code: string) {
    return await this.confirmationModel.findOne({ code }).exec()
  }

  public async updateEmailConfirmationCode(userId: string) {
    return await this.confirmationModel
      .findOneAndUpdate({ userId }, { code: uuidv4() }, { new: true })
      .exec()
  }
}

export { AuthRepository }
