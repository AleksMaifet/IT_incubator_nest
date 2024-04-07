import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GetUsersRequestQuery, IUser, IUsersResponse } from '../interfaces'
import { UserPgEntity } from '../models'

@Injectable()
class UsersSqlRepository {
  constructor(
    @InjectRepository(UserPgEntity)
    private readonly repository: Repository<UserPgEntity>,
  ) {}

  private async _getAllBySearchLoginOrEmailTerm(
    dto: GetUsersRequestQuery<number>,
  ) {
    const {
      searchEmailTerm,
      searchLoginTerm,
      pageSize,
      pageNumber,
      sortBy,
      sortDirection,
    } = dto

    const queryBuilder = this.repository
      .createQueryBuilder('u')
      .select(['u.id', 'u.login', 'u.email', 'u.createdAt'])
      .where('LOWER(u.email) LIKE LOWER(:email)', {
        email: `%${searchEmailTerm}%`,
      })
      .orWhere('LOWER(u.login) LIKE LOWER(:login)', {
        login: `%${searchLoginTerm}%`,
      })

    const totalCount = await queryBuilder.getCount()

    const { response, skip } = this._createdFindOptionsAndResponse({
      totalCount,
      pageSize,
      pageNumber,
    })

    response.items = await queryBuilder
      .orderBy(
        `"${sortBy}" COLLATE "C"`,
        sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .offset(skip)
      .take(pageSize)
      .getMany()

    return response
  }

  private async _getAllWithoutSearchLoginOrEmailTerm(
    dto: Omit<
      GetUsersRequestQuery<number>,
      'searchLoginTerm' | 'searchEmailTerm'
    >,
  ) {
    const { pageSize, pageNumber, sortBy, sortDirection } = dto

    const totalCount = await this.repository.createQueryBuilder().getCount()

    const { response, skip } = this._createdFindOptionsAndResponse({
      pageNumber,
      pageSize,
      totalCount,
    })

    response.items = await this.repository
      .createQueryBuilder('u')
      .select(['u.id', 'u.login', 'u.email', 'u.createdAt'])
      .orderBy(`"${sortBy}"`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .offset(skip)
      .take(pageSize)
      .getMany()

    return response
  }

  private async _getAllWithoutSearchLoginTerm(
    dto: Omit<GetUsersRequestQuery<number>, 'searchLoginTerm'>,
  ) {
    const { searchEmailTerm, pageNumber, pageSize, sortDirection, sortBy } = dto

    const queryBuilder = this.repository
      .createQueryBuilder('u')
      .select(['u.id', 'u.login', 'u.email', 'u.createdAt'])
      .where('LOWER(u.email) LIKE LOWER(:email)', {
        email: `%${searchEmailTerm}%`,
      })

    const totalCount = await queryBuilder.getCount()

    const { response, skip } = this._createdFindOptionsAndResponse({
      pageSize,
      pageNumber,
      totalCount,
    })

    response.items = await queryBuilder
      .orderBy(`"${sortBy}"`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .offset(skip)
      .take(pageSize)
      .getMany()

    return response
  }

  private async _getAllWithoutSearchEmailTerm(
    dto: Omit<GetUsersRequestQuery<number>, 'searchEmailTerm'>,
  ) {
    const { searchLoginTerm, pageNumber, pageSize, sortBy, sortDirection } = dto

    const queryBuilder = this.repository
      .createQueryBuilder('u')
      .select(['u.id', 'u.login', 'u.email', 'u.createdAt'])
      .where('LOWER(u.login) LIKE LOWER(:login)', {
        login: `%${searchLoginTerm}%`,
      })

    const totalCount = await queryBuilder.getCount()

    const { response, skip } = this._createdFindOptionsAndResponse({
      pageNumber,
      pageSize,
      totalCount,
    })

    response.items = await queryBuilder
      .orderBy(`"${sortBy}"`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .offset(skip)
      .take(pageSize)
      .getMany()

    return response
  }

  private _createdFindOptionsAndResponse(
    dto: Pick<GetUsersRequestQuery<number>, 'pageNumber' | 'pageSize'> & {
      totalCount: number
    },
  ) {
    const { totalCount, pageNumber, pageSize } = dto

    const pagesCount = Math.ceil(totalCount / pageSize)
    const skip = (pageNumber - 1) * pageSize

    const response: IUsersResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    return { response, skip }
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
    return await this.repository
      .createQueryBuilder('u')
      .select(['u.id', 'u.login', 'u.email', 'u.createdAt'])
      .where('u.id = :id', { id })
      .getOne()
  }

  public async create(dto: IUser) {
    const result = await this.repository.save(dto)

    const { id, login, email, createdAt } = result

    return {
      id,
      login,
      email,
      createdAt,
    }
  }

  public async updatePassword(
    dto: Pick<IUser, 'id' | 'passwordSalt' | 'passwordHash'>,
  ) {
    const { id, passwordHash, passwordSalt } = dto

    return await this.repository
      .createQueryBuilder()
      .update()
      .set({ passwordHash, passwordSalt })
      .where('id = :id', { id })
      .execute()
  }

  public async getByLoginOrEmail(loginOrEmail: string) {
    return await this.repository
      .createQueryBuilder()
      .where('LOWER(login) = LOWER(:loginOrEmail)', {
        loginOrEmail,
      })
      .orWhere('LOWER(email) = LOWER(:loginOrEmail)', {
        loginOrEmail,
      })
      .getOne()
  }

  public async deleteById(id: string) {
    const result = await this.repository.delete(id)

    return result.affected
  }
}

export { UsersSqlRepository }
