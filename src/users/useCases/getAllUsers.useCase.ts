import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { GetUsersRequestQuery } from '../interfaces'
import { DEFAULTS } from '../constants'
import { UsersSqlRepository } from '../repositories'

const {
  SEARCH_LOGIN_TERM,
  SEARCH_EMAIL_TERM,
  SORT_DIRECTION,
  PAGE_NUMBER,
  PAGE_SIZE,
  SORT_BY,
} = DEFAULTS

class GetAllUsersCommand {
  constructor(public readonly payload: GetUsersRequestQuery<string>) {}
}

@CommandHandler(GetAllUsersCommand)
class GetAllUsersUseCase implements ICommandHandler<GetAllUsersCommand> {
  constructor(private readonly usersSqlRepository: UsersSqlRepository) {}

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

  async execute(command: GetAllUsersCommand) {
    const dto = this._mapQueryParamsToDB(command.payload)

    return await this.usersSqlRepository.getAll(dto)
  }
}

export { GetAllUsersUseCase, GetAllUsersCommand }
