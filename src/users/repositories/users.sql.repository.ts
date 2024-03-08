import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { GetUsersRequestQuery, IUser, IUsersResponse } from '../interfaces'

@Injectable()
class UsersSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private async _getAllBySearchLoginOrEmailTerm(
    dto: GetUsersRequestQuery<number>,
  ) {
    const { searchEmailTerm, searchLoginTerm, ...rest } = dto

    const totalCountRequest = await this.dataSource.query(
      `
      SELECT count(*) FROM users
      WHERE LOWER(email) = LOWER($1) OR LOWER(login) = LOWER($2)
    `,
      [searchEmailTerm, searchLoginTerm],
    )

    const { response } = this._createdFindOptionsAndResponse({
      ...rest,
      totalCount: Number(totalCountRequest[0].count),
    })

    const query = `
    SELECT id, login, email, "createdAt" FROM users
    WHERE LOWER(email) = LOWER($1) OR LOWER(login) = LOWER($2)
    ORDER BY "${dto.sortBy}" ${dto.sortDirection}
    LIMIT $3 OFFSET $4;
    `

    response.items = await this.dataSource.query(query, [
      searchEmailTerm,
      searchLoginTerm,
      dto.pageSize,
      (dto.pageNumber - 1) * dto.pageSize,
    ])

    return response
  }

  private async _getAllWithoutSearchLoginOrEmailTerm(
    dto: Omit<
      GetUsersRequestQuery<number>,
      'searchLoginTerm' | 'searchEmailTerm'
    >,
  ) {
    const totalCountRequest = await this.dataSource.query(`
      SELECT count(*) FROM users
    `)

    const { response } = this._createdFindOptionsAndResponse({
      ...dto,
      totalCount: Number(totalCountRequest[0].count),
    })

    // TODO think about sql injections
    const query = `
      SELECT id, login, email, "createdAt" from users
      ORDER BY "${dto.sortBy}" ${dto.sortDirection}
      LIMIT $1 OFFSET $2;
    `

    response.items = await this.dataSource.query(query, [
      dto.pageSize,
      (dto.pageNumber - 1) * dto.pageSize,
    ])

    return response
  }

  private async _getAllWithoutSearchLoginTerm(
    dto: Omit<GetUsersRequestQuery<number>, 'searchLoginTerm'>,
  ) {
    const { searchEmailTerm, ...rest } = dto

    // TODO think about sql injections
    const query = `
      SELECT id, login, email, "createdAt" from users
      WHERE LOWER(email) = LOWER($1)
      ORDER BY "${dto.sortBy}" ${dto.sortDirection}
      LIMIT $2 OFFSET $3;
    `

    const getUserByEmail = await this.dataSource.query(query, [
      searchEmailTerm,
      dto.pageSize,
      (dto.pageNumber - 1) * dto.pageSize,
    ])

    const { response } = this._createdFindOptionsAndResponse({
      ...rest,
      totalCount: getUserByEmail.length,
    })

    response.items = getUserByEmail

    return response
  }

  private async _getAllWithoutSearchEmailTerm(
    dto: Omit<GetUsersRequestQuery<number>, 'searchEmailTerm'>,
  ) {
    const { searchLoginTerm, ...rest } = dto

    // TODO think about sql injections
    const query = `
      SELECT id, login, email, "createdAt" from users
      WHERE LOWER(login) = LOWER($1)
      ORDER BY "${dto.sortBy}" ${dto.sortDirection}
      LIMIT $2 OFFSET $3;
    `

    const getUserByEmail = await this.dataSource.query(query, [
      searchLoginTerm,
      dto.pageSize,
      (dto.pageNumber - 1) * dto.pageSize,
    ])

    const { response } = this._createdFindOptionsAndResponse({
      ...rest,
      totalCount: getUserByEmail.length,
    })

    response.items = getUserByEmail

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
    const { totalCount, pageNumber, pageSize } = dto

    const pagesCount = Math.ceil(totalCount / pageSize)

    const response: IUsersResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    return { response }
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
    const result = await this.dataSource.query(
      `
       SELECT id, login, email, "createdAt" from users
       WHERE id = $1
    `,
      [id],
    )

    return result[0]
  }

  public async create(dto: IUser) {
    const query = `
    INSERT INTO users (login, email, "passwordSalt", "passwordHash", "createdAt")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, login, email, "createdAt"
    `

    const result = await this.dataSource.query(query, Object.values(dto))

    return result[0]
  }

  public async updatePassword(
    dto: Pick<IUser, 'id' | 'passwordSalt' | 'passwordHash'>,
  ) {
    const { id, passwordHash, passwordSalt } = dto

    const query = `
      UPDATE users
      SET "passwordHash" = $2, "passwordSalt" = $3
      WHERE id = $1
      RETURNING *
    `

    return await this.dataSource.query(query, [id, passwordHash, passwordSalt])
  }

  public async getByLoginOrEmail(loginOrEmail: string) {
    const query = `
      SELECT * FROM users
      WHERE LOWER(login) = LOWER($1) OR LOWER(email) = LOWER($1)
    `

    const result = await this.dataSource.query(query, [loginOrEmail])

    return result[0]
  }

  public async deleteById(id: string) {
    const query = `
      DELETE from users
      WHERE id = $1
    `

    const result = await this.dataSource.query(query, [id])

    return result[1]
  }
}

export { UsersSqlRepository }
