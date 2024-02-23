import { Injectable } from '@nestjs/common'
import {
  GetCommentsRequestQuery,
  IComments,
  ICommentsResponse,
  LIKE_COMMENT_USER_STATUS_ENUM,
} from './interfaces'
import { DEFAULTS } from './constants'
import { Comment } from './comment.entity'
import { CommentsRepository } from './comments.repository'
import { IUser } from '../users'
import { BaseCommentLikeDto } from './dto'
import { CommentInfoLikeType, LikesService } from '../likes'

const { SORT_DIRECTION, PAGE_NUMBER, PAGE_SIZE, SORT_BY } = DEFAULTS

@Injectable()
export class CommentsService {
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly likesService: LikesService,
  ) {}

  private _mapGenerateLikeResponse(
    comments: ICommentsResponse,
    likeStatusComments: CommentInfoLikeType<LIKE_COMMENT_USER_STATUS_ENUM>[],
  ) {
    const stash: Record<string, number> = {}

    comments.items.forEach((item, index) => {
      stash[item.id] = index
    })

    likeStatusComments.forEach((l) => {
      const currentId = l.commentId

      if (currentId in stash) {
        const currentIndex = stash[currentId]

        comments.items[currentIndex].likesInfo = {
          ...comments.items[currentIndex].likesInfo,
          myStatus: l.status ?? LIKE_COMMENT_USER_STATUS_ENUM.None,
        }
      }
    })

    return comments
  }

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
    userId,
    query,
  }: {
    postId: string
    userId: string
    query: GetCommentsRequestQuery<string>
  }) {
    const dto = this._mapQueryParamsToDB(query)

    const comments = await this.commentsRepository.getAllByPostId({
      postId,
      query: dto,
    })

    if (!userId) {
      return comments
    }

    const likes = await this.likesService.getUserLikesByUserId(userId)

    if (!likes) {
      return comments
    }

    const { likeStatusComments } = likes

    return this._mapGenerateLikeResponse(comments, likeStatusComments)
  }

  public async getById({ id, userId }: { id: string; userId: string }) {
    const comment = await this.commentsRepository.getById(id)

    if (!comment) return null

    if (!userId) {
      return comment
    }

    const likes = await this.likesService.getUserLikesByUserId(userId)

    if (!likes) {
      return comment
    }

    likes.likeStatusComments.forEach((l) => {
      if (l.commentId === comment.id) {
        comment.likesInfo = {
          ...comment.likesInfo,
          myStatus: l.status,
        }
      }
    })

    return comment
  }

  public async updateById(dto: Pick<IComments, 'id' | 'content'>) {
    return await this.commentsRepository.updateById(dto)
  }

  public async deleteById(id: string) {
    return await this.commentsRepository.deleteById(id)
  }

  public async updateLikeById(
    dto: {
      commentId: string
      user: Pick<IUser, 'id' | 'login'>
    } & BaseCommentLikeDto,
  ) {
    const {
      commentId,
      likeStatus,
      user: { id, login },
    } = dto

    const { likeStatusComments } = await this.likesService.create({
      userId: id,
      userLogin: login,
    })

    if (!likeStatusComments) return

    const isExist = likeStatusComments.findIndex(
      (info) => info.commentId === commentId && info.status === likeStatus,
    )

    const isFirst = likeStatusComments.findIndex(
      (info) => info.commentId === commentId,
    )

    if (isExist !== -1) {
      return
    }

    await this.likesService.updateUserCommentLikes({
      userId: id,
      likeStatus,
      commentId,
    })

    await this.commentsRepository.updateLikeWithStatusLikeOrDislike({
      isFirstTime: isFirst === -1,
      likeStatus,
      commentId,
    })

    return true
  }
}
