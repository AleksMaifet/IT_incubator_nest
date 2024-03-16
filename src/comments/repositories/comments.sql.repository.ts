import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import {
  GetCommentsRequestQuery,
  IComments,
  ICommentsResponse,
} from '../interfaces'

@Injectable()
class CommentsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private _mapGenerateCommentResponse(
    comment: Pick<IComments, 'id' | 'content' | 'createdAt' | 'likesInfo'> & {
      userId: string
      userLogin: string
    },
  ) {
    const { id, content, userId, userLogin, createdAt, likesInfo } = comment

    return {
      id: id,
      content: content,
      commentatorInfo: {
        userId: userId,
        userLogin: userLogin,
      },
      createdAt: createdAt,
      likesInfo: likesInfo,
    }
  }

  public async create(dto: IComments) {
    const { postId, content, commentatorInfo, createdAt, likesInfo } = dto
    const { userId, userLogin } = commentatorInfo

    const result = await this.dataSource.query(
      `
        INSERT INTO comments ("postId", content, "userId", "userLogin", "createdAt", "likesInfo")
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `,
      [postId, content, userId, userLogin, createdAt, likesInfo],
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

  // public async updateLikeWithStatusLikeOrDislike(
  //   dto: {
  //     commentId: string
  //     isFirstTime: boolean
  //   } & BaseCommentLikeDto,
  // ) {
  //   const { commentId, likeStatus, isFirstTime } = dto
  //
  //   const comment = await this.commentModel.findOne({ id: commentId })
  //   const currentComment = comment!
  //   const { likesInfo } = currentComment
  //
  //   switch (likeStatus as string) {
  //     case LIKE_COMMENT_USER_STATUS_ENUM.None:
  //       likesInfo.likesCount = LIKES_COUNT
  //       likesInfo.dislikesCount = DISLIKES_COUNT
  //       break
  //     case LIKE_COMMENT_USER_STATUS_ENUM.Like:
  //       likesInfo.likesCount += 1
  //
  //       if (isFirstTime) {
  //         break
  //       }
  //
  //       likesInfo.dislikesCount -= 1
  //
  //       break
  //     case LIKE_COMMENT_USER_STATUS_ENUM.Dislike:
  //       likesInfo.dislikesCount += 1
  //
  //       if (isFirstTime) {
  //         break
  //       }
  //
  //       likesInfo.likesCount -= 1
  //
  //       break
  //     default:
  //       break
  //   }
  //
  //   comment.markModified('likesInfo')
  //
  //   return await currentComment.save()
  // }
}

export { CommentsSqlRepository }
