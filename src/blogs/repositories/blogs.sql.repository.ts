import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { GetBlogsRequestQuery, IBlog, IBlogsResponse } from '../interfaces'
import { UpdateBlogDto } from '../dto'
import { BlogPgEntity } from '../models'

@Injectable()
class BlogsSqlRepository {
  constructor(
    @InjectRepository(BlogPgEntity)
    private readonly repository: Repository<BlogPgEntity>,
  ) {}

  private async _getAllBySearchNameTerm(dto: GetBlogsRequestQuery<number>) {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } = dto

    const queryBuilder = this.repository
      .createQueryBuilder('b')
      .where('LOWER(b.name) LIKE LOWER(:name)', {
        name: `%${searchNameTerm}%`,
      })

    const totalCount = await queryBuilder.getCount()

    const { response, skip } = this._createdResponse({
      pageNumber,
      pageSize,
      totalCount,
    })

    response.items = await queryBuilder
      .orderBy(
        `"${sortBy}" COLLATE "C"`,
        sortDirection.toUpperCase() as 'ASC' | 'DESC',
      )
      .skip(skip)
      .take(pageSize)
      .getMany()

    return response
  }

  private async _getAllWithoutSearchNameTerm(
    dto: Omit<GetBlogsRequestQuery<number>, 'searchNameTerm'>,
  ) {
    const { sortBy, sortDirection, pageNumber, pageSize } = dto

    const queryBuilder = this.repository.createQueryBuilder()

    const totalCount = await queryBuilder.getCount()

    const { response, skip } = this._createdResponse({
      pageNumber,
      pageSize,
      totalCount,
    })

    response.items = await queryBuilder
      .orderBy(`"${sortBy}"`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(pageSize)
      .getMany()

    return response
  }

  private _createdResponse<T>(
    dto: Pick<
      GetBlogsRequestQuery<number> & {
        totalCount: number
      },
      'totalCount' | 'pageNumber' | 'pageSize'
    >,
  ) {
    const { totalCount, pageNumber, pageSize } = dto

    const pagesCount = Math.ceil(totalCount / pageSize)
    const skip = (pageNumber - 1) * pageSize

    const response: IBlogsResponse<T> = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    return { response, skip }
  }

  public async getAll(dto: GetBlogsRequestQuery<number>) {
    const { searchNameTerm, ...rest } = dto

    if (searchNameTerm === 'null') {
      return await this._getAllWithoutSearchNameTerm(rest)
    }

    return await this._getAllBySearchNameTerm(dto)
  }

  public async getById(id: string) {
    return await this.repository.findOneBy({ id })
  }

  public async updateById(id: string, dto: UpdateBlogDto) {
    const { name, description, websiteUrl } = dto

    const result = await this.repository.update(
      { id },
      {
        name,
        description,
        websiteUrl,
      },
    )

    return result.affected
  }

  public async create(dto: IBlog) {
    const { name, description, websiteUrl, createdAt, isMembership } = dto

    return await this.repository.save({
      name,
      description,
      websiteUrl,
      createdAt,
      isMembership,
    })
  }

  public async deleteById(id: string) {
    const result = await this.repository.delete(id)

    return result.affected
  }
}

export { BlogsSqlRepository }
