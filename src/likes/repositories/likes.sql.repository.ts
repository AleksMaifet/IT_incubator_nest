import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { BasePostLikeDto } from '../../posts'
import { CommentInfoLikeType, PostInfoLikeType } from '../interfaces'
import { BaseCommentLikeDto } from '../../comments'

class LikesSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async createPostLike(
    dto: {
      userId: string
      userLogin: string
    } & Pick<PostInfoLikeType, 'postId'>,
  ) {
    const { userId, userLogin, postId } = dto
    let result

    result = await this.dataSource.query(
      `
        SELECT * FROM "postLike"
        WHERE "userId" = $1 AND "postId" = $2 AND "addedAt" IS NOT NULL
    `,
      [userId, postId],
    )

    if (!result[0]) {
      result = await this.dataSource.query(
        `
            INSERT INTO "postLike" ("userId", "userLogin", "postId")
            VALUES ($1, $2, $3)
            RETURNING *
    `,
        [userId, userLogin, postId],
      )
    }

    return result.map(({ status, postId, addedAt }) => ({
      status,
      postId,
      addedAt,
    }))
  }

  public async getPostLikesByUserId(userId: string) {
    return await this.dataSource.query(
      `
      SELECT * FROM "postLike"
      WHERE "userId" = $1
    `,
      [userId],
    )
  }

  public async updateUserPostLikes(
    dto: { postId: string; userId: string; addedAt: Date } & BasePostLikeDto,
  ) {
    const { postId, userId, likeStatus, addedAt } = dto

    const result = await this.dataSource.query(
      `
     UPDATE "postLike"
     SET "status" = $3, "addedAt" = $4
     WHERE "userId" = $1 AND "postId" = $2
     `,
      [userId, postId, likeStatus, addedAt],
    )

    return result[1]
  }

  public async createCommentLike(
    dto: {
      userId: string
      userLogin: string
    } & Pick<CommentInfoLikeType, 'commentId'>,
  ) {
    const { userId, userLogin, commentId } = dto

    const result = await this.dataSource.query(
      `
      WITH checked AS (
        SELECT * FROM "commentLike"
        WHERE "userId" = $1 AND "commentId" = $3 AND "addedAt" IS NOT NULL
    ),
     inserted AS (
        INSERT INTO "commentLike" ("userId", "userLogin", "commentId")
        VALUES ($1, $2, $3)
        RETURNING *
    )
    SELECT * FROM checked
    UNION ALL
    SELECT * FROM inserted
    `,
      [userId, userLogin, commentId],
    )

    return result.map(({ status, commentId, addedAt }) => ({
      status,
      commentId,
      addedAt,
    }))
  }

  public async getCommentLikesByUserId(userId: string) {
    return await this.dataSource.query(
      `
      SELECT * FROM "commentLike"
      WHERE "userId" = $1
    `,
      [userId],
    )
  }

  public async updateUserCommentLikes(
    dto: { commentId: string; userId: string } & BaseCommentLikeDto,
  ) {
    const { commentId, userId, likeStatus } = dto

    const result = await this.dataSource.query(
      `
     UPDATE "commentLike"
     SET "status" = $3, "addedAt" = $4
     WHERE "userId" = $1 AND "commentId" = $2
     `,
      [userId, commentId, likeStatus, new Date()],
    )

    return result[1]
  }
}

export { LikesSqlRepository }
