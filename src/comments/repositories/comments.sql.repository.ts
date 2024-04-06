import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LIKE_POST_USER_STATUS_ENUM } from '../../posts'
import {
  GetCommentsRequestQuery,
  IComments,
  ICommentsResponse,
} from '../interfaces'
import { DEFAULTS_COMMENT_LIKE_STATUS } from '../constants'
import { BaseCommentLikeDto } from '../dto'
import { CommentPgEntity } from '../models'

const { LIKES_COUNT, DISLIKES_COUNT, MY_STATUS } = DEFAULTS_COMMENT_LIKE_STATUS

@Injectable()
class CommentsSqlRepository {
  constructor(
    @InjectRepository(CommentPgEntity)
    private readonly repository: Repository<CommentPgEntity>,
  ) {}

  private _mapGenerateCommentResponse(
    comment: Pick<IComments, 'id' | 'content' | 'createdAt'> & {
      userId: string
      userLogin: string
      likesCount: number
      dislikesCount: number
    },
  ) {
    const {
      id,
      content,
      userId,
      userLogin,
      createdAt,
      likesCount,
      dislikesCount,
    } = comment

    return {
      id: id,
      content: content,
      commentatorInfo: {
        userId: userId,
        userLogin: userLogin,
      },
      createdAt: createdAt,
      likesInfo: {
        likesCount,
        dislikesCount,
        myStatus: MY_STATUS,
      },
    }
  }

  public async create({ dto, userId }: { dto: IComments; userId: string }) {
    const {
      postId,
      content,
      createdAt,
      likesInfo: { likesCount, dislikesCount },
    } = dto

    const comment = await this.repository.save({
      content,
      createdAt,
      likesCount,
      dislikesCount,
      user: { id: userId },
      post: { id: postId },
    })

    const result = await this.repository
      .createQueryBuilder('c')
      .where('c.id = :id', { id: comment.id })
      .leftJoin('c.user', 'u')
      .select('c.id', 'id')
      .addSelect('c.content', 'content')
      .addSelect('c.createdAt', 'createdAt')
      .addSelect('c.likesCount', 'likesCount')
      .addSelect('c.dislikesCount', 'dislikesCount')
      .addSelect('u.id', 'userId')
      .addSelect('u.login', 'userLogin')
      .getRawOne()

    return this._mapGenerateCommentResponse(result)
  }

  public async getById(id: string) {
    const result = await this.repository
      .createQueryBuilder('c')
      .where('c.id = :id', { id })
      .leftJoin('c.user', 'u')
      .select('c.id', 'id')
      .addSelect('c.content', 'content')
      .addSelect('c.createdAt', 'createdAt')
      .addSelect('c.likesCount', 'likesCount')
      .addSelect('c.dislikesCount', 'dislikesCount')
      .addSelect('u.id', 'userId')
      .addSelect('u.login', 'userLogin')
      .getRawOne()

    if (!result) {
      return null
    }

    return this._mapGenerateCommentResponse(result)
  }

  public async getAllByPostId(dto: {
    postId: string
    query: GetCommentsRequestQuery<number>
  }) {
    const { postId, query: queryFromClient } = dto
    const { pageNumber, pageSize, sortBy, sortDirection } = queryFromClient

    const totalCount = await this.repository.countBy({ post: { id: postId } })

    const pagesCount = Math.ceil(totalCount / pageSize)
    const skip = (pageNumber - 1) * pageSize

    const response: ICommentsResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    const result = await this.repository
      .createQueryBuilder('c')
      .where('c.post.id = :postId', { postId })
      .leftJoin('c.user', 'u')
      .select('c.id', 'id')
      .addSelect('c.content', 'content')
      .addSelect('c.createdAt', 'createdAt')
      .addSelect('c.likesCount', 'likesCount')
      .addSelect('c.dislikesCount', 'dislikesCount')
      .addSelect('u.id', 'userId')
      .addSelect('u.login', 'userLogin')
      .orderBy(`"${sortBy}"`, sortDirection.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .limit(pageSize)
      .getRawMany()

    response.items = result.map(this._mapGenerateCommentResponse)

    return response
  }

  public async updateById(dto: Pick<IComments, 'id' | 'content'>) {
    const { id, content } = dto

    const result = await this.repository.update({ id }, { content })

    return result.affected
  }

  public async deleteById(id: string) {
    const result = await this.repository.delete({ id })

    return result.affected
  }

  public async updateLikeWithStatusLikeOrDislike(
    dto: {
      commentId: string
      isFirstTime: boolean
    } & BaseCommentLikeDto,
  ) {
    const { commentId, likeStatus, isFirstTime } = dto

    const result = await this.repository
      .createQueryBuilder()
      .update()
      .set({
        likesCount: () => {
          switch (likeStatus as string) {
            case LIKE_POST_USER_STATUS_ENUM.None:
              return `${LIKES_COUNT}`
            case LIKE_POST_USER_STATUS_ENUM.Like:
              return 'likesCount + 1'
            case LIKE_POST_USER_STATUS_ENUM.Dislike:
              if (isFirstTime) {
                return 'likesCount'
              }
              return 'GREATEST(likesCount - 1, 0)'
            default:
              return 'likesCount'
          }
        },
        dislikesCount: () => {
          switch (likeStatus as string) {
            case LIKE_POST_USER_STATUS_ENUM.None:
              return `${DISLIKES_COUNT}`
            case LIKE_POST_USER_STATUS_ENUM.Dislike:
              return 'dislikesCount + 1'
            case LIKE_POST_USER_STATUS_ENUM.Like:
              if (isFirstTime) {
                return 'dislikesCount'
              }
              return 'GREATEST(dislikesCount - 1, 0)'
            default:
              return 'dislikesCount'
          }
        },
      })
      .where('id = :commentId', { commentId })
      .execute()

    return result.affected
  }
}

export { CommentsSqlRepository }
