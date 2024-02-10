import { Injectable } from '@nestjs/common'
import { DEFAULTS } from './constants'
import { GetBlogsRequestQuery } from './interfaces'
import { BlogsRepository } from './blogs.repository'
import { Blog } from './blog.entity'
import { CreateBlogDto, UpdateBlogDto } from './dto'
import { BasePostDto, PostsService } from '../posts'

const { SEARCH_NAME_TERM, SORT_DIRECTION, PAGE_NUMBER, PAGE_SIZE, SORT_BY } =
  DEFAULTS

@Injectable()
export class BlogsService {
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly postsService: PostsService,
  ) {}

  public async getAll(query: GetBlogsRequestQuery<string>) {
    const dto = this._mapQueryParamsToDB(query)

    return await this.blogsRepository.getAll(dto)
  }

  public async getById(id: string) {
    return await this.blogsRepository.getById(id)
  }

  public async getPostsByBlogId({
    id,
    query,
  }: {
    id: string
    query: Omit<GetBlogsRequestQuery<string>, 'searchNameTerm'>
  }) {
    return await this.postsService.getPostsByBlogId({ id, query })
  }

  public async createPostsByBlogId({
    id,
    body,
  }: {
    id: string
    body: BasePostDto
  }) {
    return await this.postsService.create({ ...body, blogId: id })
  }

  public async updateById(id: string, dto: UpdateBlogDto) {
    return await this.blogsRepository.updateById(id, dto)
  }

  public async create({ name, description, websiteUrl }: CreateBlogDto) {
    const newBlog = new Blog(name, description, websiteUrl)

    return await this.blogsRepository.create(newBlog)
  }

  public async deleteById(id: string) {
    return await this.blogsRepository.deleteById(id)
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
