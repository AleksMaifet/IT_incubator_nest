import { Injectable } from '@nestjs/common'
import { GetCommentsRequestQuery, IComments } from './interfaces'
import { DEFAULTS } from './constants'
import { Comment } from './comment.entity'
import { CommentsRepository } from './comments.repository'

const { SORT_DIRECTION, PAGE_NUMBER, PAGE_SIZE, SORT_BY } = DEFAULTS

@Injectable()
export class CommentsService {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  private _mapQueryParamsToDB(query: GetCommentsRequestQuery<string>) {
    const { sortBy, sortDirection, pageNumber, pageSize } = query

    const numPageNumber = Number(pageNumber)
    const numPageSize = Number(pageSize)

    return {
      sortBy: sortBy ?? SORT_BY,
      sortDirection: SORT_DIRECTION[sortDirection] ?? SORT_DIRECTION.desc,
      pageNumber: isFinite(numPageNumber)
        ? Math.max(numPageNumber, PAGE_NUMBER)
        : PAGE_NUMBER,
      pageSize: isFinite(numPageSize) ? numPageSize : PAGE_SIZE,
    }
  }

  public async create(
    dto: Pick<IComments, 'content' | 'commentatorInfo'> & { postId: string },
  ) {
    const { postId, content, commentatorInfo } = dto

    const newComment = new Comment(postId, content, commentatorInfo)

    return await this.commentsRepository.create(newComment)
  }

  public async getAllByPostId({
    postId,
    query,
  }: {
    postId: string
    query: GetCommentsRequestQuery<string>
  }) {
    const dto = this._mapQueryParamsToDB(query)

    return await this.commentsRepository.getAllByPostId({
      postId,
      query: dto,
    })
  }

  public async getById({ id, userId }: { id: string; userId: string }) {
    const comment = await this.commentsRepository.getById(id)

    if (!comment) return null

    if (!userId) {
      return comment
    }

    return comment
  }

  public async updateById(dto: Pick<IComments, 'id' | 'content'>) {
    return await this.commentsRepository.updateById(dto)
  }

  public async deleteById(id: string) {
    return await this.commentsRepository.deleteById(id)
  }
}
