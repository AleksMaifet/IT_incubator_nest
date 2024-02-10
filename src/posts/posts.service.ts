import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { PostsRepository } from './posts.repository'
import { GetPostsRequestQuery } from './interfaces'
import { DEFAULTS } from './constants'
import { CreatePostDto, UpdatePostDto } from './dto'
import { Post } from './post.entity'
import { BlogsService } from '../blogs'

const { SORT_DIRECTION, PAGE_NUMBER, PAGE_SIZE, SORT_BY } = DEFAULTS

@Injectable()
export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    @Inject(forwardRef(() => BlogsService))
    private readonly blogsService: BlogsService,
  ) {}

  private _mapQueryParamsToDB(query: GetPostsRequestQuery<string>) {
    const { sortBy, sortDirection, pageNumber, pageSize } = query

    const numPageNumber = Number(pageNumber)
    const numPageSize = Number(pageSize)
    const availablePageNumber =
      numPageNumber < PAGE_NUMBER ? PAGE_NUMBER : numPageNumber

    return {
      sortBy: sortBy ?? SORT_BY,
      sortDirection: SORT_DIRECTION[sortDirection!] ?? SORT_DIRECTION.desc,
      pageNumber: isFinite(numPageNumber) ? availablePageNumber : PAGE_NUMBER,
      pageSize: isFinite(numPageSize) ? numPageSize : PAGE_SIZE,
    }
  }

  public async getAll(query: GetPostsRequestQuery<string>) {
    const dto = this._mapQueryParamsToDB(query)

    return await this.postsRepository.getAll(dto)
  }

  public async getById(id: string) {
    return await this.postsRepository.getById(id)
  }

  public async getPostsByBlogId({
    id,
    query,
  }: {
    id: string
    query: GetPostsRequestQuery<string>
  }) {
    const dto = this._mapQueryParamsToDB(query)

    return await this.postsRepository.getPostsByBlogId(id, dto)
  }

  public async updateById({ id, dto }: { id: string; dto: UpdatePostDto }) {
    return await this.postsRepository.updateById(id, dto)
  }

  public async create({
    title,
    shortDescription,
    content,
    blogId,
  }: CreatePostDto) {
    const blog = await this.blogsService.getById(blogId)

    const newPost = new Post(
      title,
      shortDescription,
      content,
      blogId,
      blog.name,
    )

    return await this.postsRepository.create(newPost)
  }

  public async deleteById(id: string) {
    return await this.postsRepository.deleteById(id)
  }
}
