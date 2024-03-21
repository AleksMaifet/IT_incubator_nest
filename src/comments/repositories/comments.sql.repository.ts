import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import {
  GetCommentsRequestQuery,
  IComments,
  ICommentsResponse,
} from '../interfaces'
import { DEFAULTS_COMMENT_LIKE_STATUS } from '../constants'
import { BaseCommentLikeDto } from '../dto'

const { LIKES_COUNT, DISLIKES_COUNT, MY_STATUS } = DEFAULTS_COMMENT_LIKE_STATUS

@Injectable()
class CommentsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

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

  public async create(dto: IComments) {
    const {
      postId,
      content,
      commentatorInfo,
      createdAt,
      likesInfo: { likesCount, dislikesCount },
    } = dto
    const { userId, userLogin } = commentatorInfo

    const result = await this.dataSource.query(
      `
        INSERT INTO comments ("postId", content, "userId", "userLogin", "createdAt", "likesCount", "dislikesCount")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `,
      [
        postId,
        content,
        userId,
        userLogin,
        createdAt,
        likesCount,
        dislikesCount,
      ],
    )

    return result.map(this._mapGenerateCommentResponse)[0]
  }

  public async getById(id: string) {
    const query = `
    SELECT * FROM comments
    WHERE id = $1
    `
    const result = await this.dataSource.query(query, [id])

    if (!result.length) {
      return null
    }

    return result.map(this._mapGenerateCommentResponse)[0]
  }

  public async getAllByPostId(dto: {
    postId: string
    query: GetCommentsRequestQuery<number>
  }) {
    const { postId, query: queryFromClient } = dto
    const { pageNumber, pageSize, sortBy, sortDirection } = queryFromClient

    const totalCountRequest = await this.dataSource.query(
      `
      SELECT count(*) FROM comments
      WHERE "postId" = $1
    `,
      [postId],
    )

    const totalCount = Number(totalCountRequest[0].count)
    const pagesCount = Math.ceil(totalCount / pageSize)
    const skip = (pageNumber - 1) * pageSize

    const response: ICommentsResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    // TODO think about sql injections
    const query = `
    SELECT * FROM comments
    WHERE "postId" = $1
    ORDER BY "${sortBy}" ${sortDirection}
    LIMIT $2 OFFSET $3;
    `
    const result = await this.dataSource.query(query, [postId, pageSize, skip])

    response.items = result.map(this._mapGenerateCommentResponse)

    return response
  }

  public async updateById(dto: Pick<IComments, 'id' | 'content'>) {
    const { id, content } = dto

    const query = `
      UPDATE comments
      SET content = $2
      WHERE id = $1
    `

    const result = await this.dataSource.query(query, [id, content])

    return result[1]
  }

  public async deleteById(id: string) {
    const query = `
      DELETE from comments
      WHERE id = $1
    `

    const result = await this.dataSource.query(query, [id])

    return result[1]
  }

  public async updateLikeWithStatusLikeOrDislike(
    dto: {
      commentId: string
      isFirstTime: boolean
    } & BaseCommentLikeDto,
  ) {
    const { commentId, likeStatus, isFirstTime } = dto

    const result = await this.dataSource.query(
      `
      UPDATE comments
      SET
        "likesCount" = CASE
            WHEN $2 = 'Like' AND $3 THEN "likesCount" + 1
            WHEN $2 = 'Like' AND NOT $3 THEN "likesCount" + 1
            WHEN $2 = 'Dislike' AND NOT $3 THEN GREATEST("likesCount" - 1, ${LIKES_COUNT})
      ELSE "likesCount"
      END,
        "dislikesCount" = CASE
            WHEN $2 = 'Dislike' AND $3 THEN "dislikesCount" + 1
            WHEN $2 = 'Dislike' AND NOT $3 THEN "dislikesCount" + 1
            WHEN $2 = 'Like' AND NOT $3 THEN GREATEST("dislikesCount" - 1, ${DISLIKES_COUNT})
      ELSE "dislikesCount"
      END
      WHERE id = $1
    `,
      [commentId, likeStatus, isFirstTime],
    )

    return result[1]
  }
}

export { CommentsSqlRepository }
