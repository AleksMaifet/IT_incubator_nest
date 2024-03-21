import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import {
  GetPostsRequestQuery,
  IPost,
  IPostsResponse,
  LIKE_POST_USER_STATUS_ENUM,
} from '../interfaces'
import { BasePostLikeDto, UpdatePostDto } from '../dto'
import { DEFAULTS_POST_LIKE_STATUS } from '../constants'

const { LIKES_COUNT, DISLIKES_COUNT, MY_STATUS } = DEFAULTS_POST_LIKE_STATUS

@Injectable()
class PostsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  private async _mapGeneratePostResponse(
    post: Pick<
      IPost,
      | 'id'
      | 'blogId'
      | 'title'
      | 'shortDescription'
      | 'content'
      | 'blogName'
      | 'createdAt'
    > & { likesCount: number; dislikesCount: number },
  ) {
    const {
      id,
      blogId,
      title,
      shortDescription,
      content,
      blogName,
      createdAt,
      likesCount,
      dislikesCount,
    } = post

    const newestLikes = await this.dataSource.query(
      `
      SELECT "addedAt", "userId", "userLogin" AS login FROM "postLike"
      WHERE status = $1 AND "postId" = $2
      ORDER BY "addedAt" DESC LIMIT 3
    `,
      [LIKE_POST_USER_STATUS_ENUM.Like, id],
    )

    return {
      id,
      title,
      shortDescription,
      content,
      blogId,
      blogName,
      createdAt,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus: MY_STATUS,
        newestLikes,
      },
    }
  }

  public async getAll(dto: GetPostsRequestQuery<number>) {
    const { sortBy, sortDirection, pageNumber, pageSize } = dto

    const totalCountRequest = await this.dataSource.query(`
      SELECT count(*) FROM posts
    `)

    const totalCount = Number(totalCountRequest[0].count)
    const skip = (pageNumber - 1) * pageSize
    const pagesCount = Math.ceil(totalCount / pageSize)

    const response: IPostsResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    // TODO think about sql injections
    const query = `
      SELECT * from posts
      ORDER BY "${sortBy}" ${sortDirection}
      LIMIT $1 OFFSET $2;
    `

    const result = await this.dataSource.query(query, [pageSize, skip])
    const items = []

    for (let i = 0; i < result.length; i++) {
      const post = await this._mapGeneratePostResponse(result[i])

      items.push(post)
    }

    response.items = items
    return response
  }

  public async getPostsByBlogId(id: string, dto: GetPostsRequestQuery<number>) {
    const { pageSize, pageNumber, sortDirection, sortBy } = dto

    const totalCountRequest = await this.dataSource.query(
      `
      SELECT 
        count(*) 
      FROM 
        posts
      WHERE "blogId" = $1
    `,
      [id],
    )

    const totalCount = Number(totalCountRequest[0].count)
    const skip = (pageNumber - 1) * pageSize
    const pagesCount = Math.ceil(totalCount / pageSize)

    const response: IPostsResponse = {
      pagesCount,
      page: pageNumber,
      pageSize,
      totalCount,
      items: [],
    }

    // TODO think about sql injections
    const query = `
      SELECT 
        * 
      FROM 
        posts
      WHERE 
        "blogId" = $1
      ORDER BY 
        "${sortBy}" ${sortDirection}
      LIMIT $2 OFFSET $3;
    `

    const result = await this.dataSource.query(query, [id, pageSize, skip])
    const items = []

    for (let i = 0; i < result.length; i++) {
      const post = await this._mapGeneratePostResponse(result[i])

      items.push(post)
    }

    response.items = items

    return response
  }

  public async getById(id: string) {
    const result = await this.dataSource.query(
      `
       SELECT * from posts
       WHERE id = $1
    `,
      [id],
    )

    if (result[0]) {
      return await this._mapGeneratePostResponse(result[0])
    }

    return null
  }

  public async updateById(id: string, dto: UpdatePostDto) {
    const { title, shortDescription, content, blogId } = dto

    const query = `
      UPDATE 
        posts
      SET 
        title = $2, "shortDescription" = $3, content = $4, "blogId"=$5
      WHERE 
        id = $1
      RETURNING 
        *
    `

    const result = await this.dataSource.query(query, [
      id,
      title,
      shortDescription,
      content,
      blogId,
    ])

    return result[1]
  }

  public async create(dto: IPost) {
    const {
      blogId,
      title,
      shortDescription,
      content,
      blogName,
      createdAt,
      extendedLikesInfo: { likesCount, dislikesCount },
    } = dto

    const query = `
    INSERT INTO posts ("blogId", title, "shortDescription", content, "blogName", "createdAt", "likesCount", "dislikesCount")
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
    `

    const result = await this.dataSource.query(query, [
      blogId,
      title,
      shortDescription,
      content,
      blogName,
      createdAt,
      likesCount,
      dislikesCount,
    ])

    if (result[0]) {
      return await this._mapGeneratePostResponse(result[0])
    }

    return null
  }

  public async deleteById(id: string) {
    const query = `
      DELETE from posts
      WHERE id = $1
    `

    const result = await this.dataSource.query(query, [id])

    return result[1]
  }

  public async updateLikeWithStatusLikeOrDislike(
    dto: {
      postId: string
      isFirstTime: boolean
    } & BasePostLikeDto,
  ) {
    const { postId, likeStatus, isFirstTime } = dto

    const result = await this.dataSource.query(
      `
      UPDATE posts
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
      [postId, likeStatus, isFirstTime],
    )

    return result[1]
  }
}

export { PostsSqlRepository }
