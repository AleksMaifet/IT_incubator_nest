import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { GetBlogsRequestQuery, IBlog, IBlogsResponse } from '../interfaces'
import { UpdateBlogDto } from '../dto'

@Injectable()
class BlogsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private async _getAllBySearchNameTerm(dto: GetBlogsRequestQuery<number>) {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } = dto

    const totalCountRequest = await this.dataSource.query(
      `
      SELECT count(*) FROM blogs
      WHERE LOWER(name) = LOWER($1)
    `,
      [searchNameTerm],
    )

    const { response } = this._createdFindOptionsAndResponse({
      pageNumber,
      pageSize,
      totalCount: Number(totalCountRequest[0].count),
    })

    // TODO think about sql injections
    const query = `
    SELECT * FROM blogs
    WHERE LOWER(name) = LOWER($1)
    ORDER BY "${sortBy}" ${sortDirection}
    LIMIT $2 OFFSET $3;
    `

    response.items = await this.dataSource.query(query, [
      searchNameTerm,
      pageSize,
      (pageNumber - 1) * pageSize,
    ])

    return response
  }

  private async _getAllWithoutSearchNameTerm(
    dto: Omit<GetBlogsRequestQuery<number>, 'searchNameTerm'>,
  ) {
    const { sortBy, sortDirection, pageNumber, pageSize } = dto

    const totalCountRequest = await this.dataSource.query(`
      SELECT count(*) FROM blogs
    `)

    const { response } = this._createdFindOptionsAndResponse({
      pageNumber,
      pageSize,
      totalCount: Number(totalCountRequest[0].count),
    })

    // TODO think about sql injections
    const query = `
      SELECT * from blogs
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $1 OFFSET $2;
    `

    response.items = await this.dataSource.query(query, [
      pageSize,
      (pageNumber - 1) * pageSize,
    ])

    return response
  }

  private _createdFindOptionsAndResponse<T>(
    dto: Pick<
      GetBlogsRequestQuery<number> & {
        totalCount: number
      },
      'totalCount' | 'pageNumber' | 'pageSize'
    >,
  ) {
    const { totalCount, pageNumber, pageSize } = dto

    const pagesCount = Math.ceil(totalCount / pageSize)

    const response: IBlogsResponse<T> = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    return { response }
  }

  public async getAll(dto: GetBlogsRequestQuery<number>) {
    const { searchNameTerm, ...rest } = dto

    if (searchNameTerm === 'null') {
      return await this._getAllWithoutSearchNameTerm(rest)
    }

    return await this._getAllBySearchNameTerm(dto)
  }

  public async getById(id: string) {
    const result = await this.dataSource.query(
      `
       SELECT * from blogs
       WHERE id = $1
    `,
      [id],
    )

    return result[0]
  }

  public async updateById(id: string, dto: UpdateBlogDto) {
    const { name, description, websiteUrl } = dto

    const query = `
      UPDATE blogs
      SET name = $2, description = $3, "websiteUrl" = $4
      WHERE id = $1
      RETURNING *
    `

    const result = await this.dataSource.query(query, [
      id,
      name,
      description,
      websiteUrl,
    ])

    return result[1]
  }

  public async create(dto: IBlog) {
    const { name, description, websiteUrl, createdAt, isMembership } = dto

    const query = `
    INSERT INTO blogs (name, description, "websiteUrl", "createdAt", "isMembership")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `

    const result = await this.dataSource.query(query, [
      name,
      description,
      websiteUrl,
      createdAt,
      isMembership,
    ])

    return result[0]
  }

  public async deleteById(id: string) {
    const query = `
      DELETE from blogs
      WHERE id = $1
    `

    const result = await this.dataSource.query(query, [id])

    return result[1]
  }
}

export { BlogsSqlRepository }
