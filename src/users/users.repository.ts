import { InjectModel } from '@nestjs/mongoose'
import { Injectable } from '@nestjs/common'
import { Model } from 'mongoose'
import { GetUsersRequestQuery, IUser, IUsersResponse } from './interfaces'
import { UserModel } from './user.model'

@Injectable()
class UsersRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserModel>,
  ) {}

  private _mapGenerateUserResponse(user: IUser) {
    const { id, login, email, createdAt } = user

    return {
      id,
      login,
      email,
      createdAt,
    }
  }

  private async _getAllBySearchLoginOrEmailTerm(
    dto: GetUsersRequestQuery<number>,
  ) {
    const { searchEmailTerm, searchLoginTerm, ...rest } = dto

    const regexEmailTerm = new RegExp(searchEmailTerm!, 'i')
    const regexLoginTerm = new RegExp(searchLoginTerm!, 'i')

    const totalCount = await this.userModel
      .find({
        $or: [
          { login: { $regex: regexLoginTerm } },
          { email: { $regex: regexEmailTerm } },
        ],
      })
      .countDocuments()

    const { response, findOptions } = this._createdFindOptionsAndResponse({
      ...rest,
      totalCount,
    })

    const users = await this.userModel
      .find(
        {
          $or: [
            { login: { $regex: regexLoginTerm } },
            { email: { $regex: regexEmailTerm } },
          ],
        },
        null,
        findOptions,
      )
      .exec()

    response.items = users.map(this._mapGenerateUserResponse)

    return response
  }

  private async _getAllWithoutSearchLoginOrEmailTerm(
    dto: Omit<
      GetUsersRequestQuery<number>,
      'searchLoginTerm' | 'searchEmailTerm'
    >,
  ) {
    const totalCount = await this.userModel.countDocuments()

    const { response, findOptions } = this._createdFindOptionsAndResponse({
      ...dto,
      totalCount,
    })

    const users = await this.userModel.find({}, null, findOptions).exec()

    response.items = users.map(this._mapGenerateUserResponse)

    return response
  }

  private async _getAllWithoutSearchLoginTerm(
    dto: Omit<GetUsersRequestQuery<number>, 'searchLoginTerm'>,
  ) {
    const { searchEmailTerm, ...rest } = dto

    const regexEmailTerm = new RegExp(searchEmailTerm!, 'i')

    const totalCount = await this.userModel
      .find({ email: { $regex: regexEmailTerm } })
      .countDocuments()

    const { response, findOptions } = this._createdFindOptionsAndResponse({
      ...rest,
      totalCount,
    })

    const users = await this.userModel
      .find({ email: { $regex: regexEmailTerm } }, null, findOptions)
      .exec()

    response.items = users.map(this._mapGenerateUserResponse)

    return response
  }

  private async _getAllWithoutSearchEmailTerm(
    dto: Omit<GetUsersRequestQuery<number>, 'searchEmailTerm'>,
  ) {
    const { searchLoginTerm, ...rest } = dto

    const regexLoginTerm = new RegExp(searchLoginTerm!, 'i')

    const totalCount = await this.userModel
      .find({ login: { $regex: regexLoginTerm } })
      .countDocuments()

    const { response, findOptions } = this._createdFindOptionsAndResponse({
      ...rest,
      totalCount,
    })

    const users = await this.userModel
      .find({ login: { $regex: regexLoginTerm } }, null, findOptions)
      .exec()

    response.items = users.map(this._mapGenerateUserResponse)

    return response
  }

  private _createdFindOptionsAndResponse(
    dto: Omit<
      GetUsersRequestQuery<number> & {
        totalCount: number
      },
      'searchLoginTerm' | 'searchEmailTerm'
    >,
  ) {
    const { totalCount, sortBy, sortDirection, pageNumber, pageSize } = dto

    const pagesCount = Math.ceil(totalCount / pageSize)
    const skip = (pageNumber - 1) * pageSize

    const findOptions = {
      limit: pageSize,
      skip: skip,
      sort: { [sortBy]: sortDirection },
    }

    const response: IUsersResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    return { response, findOptions }
  }

  public async getAll(dto: GetUsersRequestQuery<number>) {
    const { searchEmailTerm, searchLoginTerm, ...rest } = dto

    switch (true) {
      case searchLoginTerm === 'null' && searchEmailTerm === 'null':
        return await this._getAllWithoutSearchLoginOrEmailTerm(rest)
      case searchLoginTerm === 'null':
        return await this._getAllWithoutSearchLoginTerm({
          searchEmailTerm,
          ...rest,
        })
      case searchEmailTerm === 'null':
        return await this._getAllWithoutSearchEmailTerm({
          searchLoginTerm,
          ...rest,
        })
      default:
        return await this._getAllBySearchLoginOrEmailTerm(dto)
    }
  }

  public async getById(id: string) {
    const user = await this.userModel
      .findOne({
        id,
      })
      .exec()

    if (!user) {
      return null
    }

    return this._mapGenerateUserResponse(user)
  }

  public async create(dto: IUser) {
    const user = await this.userModel.create(dto)

    return this._mapGenerateUserResponse(user)
  }

  public async updatePassword(
    dto: Pick<IUser, 'id' | 'passwordSalt' | 'passwordHash'>,
  ) {
    const { id, passwordHash, passwordSalt } = dto

    return await this.userModel
      .findOneAndUpdate({ id }, { passwordSalt, passwordHash })
      .exec()
  }

  public async getByLoginOrEmail(loginOrEmail: string) {
    return await this.userModel
      .findOne({
        $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
      })
      .exec()
  }

  public async deleteById(id: string) {
    return await this.userModel.findOneAndDelete({ id }).exec()
  }
}

export { UsersRepository }
