import { Injectable } from '@nestjs/common'
import { genSalt, hash } from 'bcrypt'
import { UsersRepository } from './users.repository'
import { DEFAULTS } from './constants'
import { GetUsersRequestQuery } from './interfaces'
import { CreateUserDto } from './dto'
import { User } from './user.entity'

const {
  SEARCH_LOGIN_TERM,
  SEARCH_EMAIL_TERM,
  SORT_DIRECTION,
  PAGE_NUMBER,
  PAGE_SIZE,
  SORT_BY,
  SALT_ROUNDS,
} = DEFAULTS

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private async _generateSalt() {
    return await genSalt(SALT_ROUNDS)
  }

  private _mapQueryParamsToDB(query: GetUsersRequestQuery<string>) {
    const {
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    } = query

    const numPageNumber = Number(pageNumber)
    const numPageSize = Number(pageSize)

    return {
      searchLoginTerm: searchLoginTerm ?? SEARCH_LOGIN_TERM,
      searchEmailTerm: searchEmailTerm ?? SEARCH_EMAIL_TERM,
      sortBy: sortBy ?? SORT_BY,
      sortDirection: SORT_DIRECTION[sortDirection] ?? SORT_DIRECTION.desc,
      pageNumber: isFinite(numPageNumber)
        ? Math.max(numPageNumber, PAGE_NUMBER)
        : PAGE_NUMBER,
      pageSize: isFinite(numPageSize) ? numPageSize : PAGE_SIZE,
    }
  }

  public async generateHash(password: string, passwordSalt: string) {
    return await hash(password, passwordSalt)
  }

  public async create(dto: CreateUserDto) {
    const { login, email, password } = dto

    const passwordSalt = await this._generateSalt()
    const passwordHash = await this.generateHash(password, passwordSalt)
    const newUser = new User(login, email, passwordSalt, passwordHash)

    return await this.usersRepository.create(newUser)
  }

  public async getAll(query: GetUsersRequestQuery<string>) {
    const dto = this._mapQueryParamsToDB(query)

    return await this.usersRepository.getAll(dto)
  }

  public async deleteById(id: string) {
    return await this.usersRepository.deleteById(id)
  }

  public async updatePassword(dto: { userId: string; newPassword: string }) {
    const { userId, newPassword } = dto

    const passwordSalt = await this._generateSalt()
    const passwordHash = await this.generateHash(newPassword, passwordSalt)

    return await this.usersRepository.updatePassword({
      id: userId,
      passwordSalt,
      passwordHash,
    })
  }
}
