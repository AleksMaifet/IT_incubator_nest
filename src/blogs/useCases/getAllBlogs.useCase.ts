import { CommandHandler, ICommandHandler } from '@nestjs/cqrs'
import { GetBlogsRequestQuery } from '../interfaces'
import { DEFAULTS } from '../constants'
import { BlogsSqlRepository } from '../repositories'

const { SEARCH_NAME_TERM, SORT_DIRECTION, PAGE_NUMBER, PAGE_SIZE, SORT_BY } =
  DEFAULTS

class GetAllBlogsCommand {
  constructor(public readonly payload: GetBlogsRequestQuery<string>) {}
}

@CommandHandler(GetAllBlogsCommand)
class GetAllBlogsUseCase implements ICommandHandler<GetAllBlogsCommand> {
  constructor(private readonly blogsSqlRepository: BlogsSqlRepository) {}

  async execute(command: GetAllBlogsCommand) {
    const dto = this._mapQueryParamsToDB(command.payload)

    return await this.blogsSqlRepository.getAll(dto)
  }

  private _mapQueryParamsToDB(query: GetBlogsRequestQuery<string>) {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      query

    const numPageNumber = Number(pageNumber)
    const numPageSize = Number(pageSize)

    return {
      searchNameTerm: searchNameTerm ?? SEARCH_NAME_TERM,
      sortBy: sortBy ?? SORT_BY,
      sortDirection: SORT_DIRECTION[sortDirection] ?? SORT_DIRECTION.desc,
      pageNumber: isFinite(numPageNumber)
        ? Math.max(numPageNumber, PAGE_NUMBER)
        : PAGE_NUMBER,
      pageSize: isFinite(numPageSize) ? numPageSize : PAGE_SIZE,
    }
  }
}

export { GetAllBlogsUseCase, GetAllBlogsCommand }
