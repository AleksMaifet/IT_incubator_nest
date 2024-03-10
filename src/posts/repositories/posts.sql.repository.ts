import { Injectable } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import { DataSource } from 'typeorm'
import { GetPostsRequestQuery, IPost, IPostsResponse } from '../interfaces'
import { UpdatePostDto } from '../dto'

@Injectable()
class PostsSqlRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

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

    response.items = await this.dataSource.query(query, [pageSize, skip])

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

    response.items = await this.dataSource.query(query, [id, pageSize, skip])

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

    return result[0]
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

    return await this.dataSource.query(query, [
      id,
      title,
      shortDescription,
      content,
      blogId,
    ])
  }

  public async create(dto: IPost) {
    const {
      blogId,
      title,
      shortDescription,
      content,
      blogName,
      createdAt,
      extendedLikesInfo,
    } = dto

    const query = `
    INSERT INTO posts ("blogId", title, "shortDescription", content, "blogName", "createdAt", "extendedLikesInfo")
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
    `

    const result = await this.dataSource.query(query, [
      blogId,
      title,
      shortDescription,
      content,
      blogName,
      createdAt,
      JSON.stringify(extendedLikesInfo),
    ])

    return result[0]
  }

  public async deleteById(id: string) {
    const query = `
      DELETE from posts
      WHERE id = $1
    `

    const result = await this.dataSource.query(query, [id])

    return result[1]
  }

  //
  // public async updateLikeWithStatusLikeOrDislike(
  //   dto: {
  //     postId: string
  //     isFirstTime: boolean
  //     userLikeInfo: IUserPostLike
  //   } & BasePostLikeDto,
  // ) {
  //   const { postId, likeStatus, isFirstTime, userLikeInfo } = dto
  //
  //   const post = await this.postModel.findOne({ id: postId })
  //   const currentPost = post!
  //   const { extendedLikesInfo } = currentPost
  //
  //   switch (likeStatus as string) {
  //     case LIKE_POST_USER_STATUS_ENUM.None:
  //       extendedLikesInfo.likesCount = LIKES_COUNT
  //       extendedLikesInfo.dislikesCount = DISLIKES_COUNT
  //       break
  //     case LIKE_POST_USER_STATUS_ENUM.Like:
  //       extendedLikesInfo.likesCount += 1
  //
  //       if (extendedLikesInfo.newestLikes.length >= MAX_NEWEST_LIKES_COUNT) {
  //         extendedLikesInfo.newestLikes.pop()
  //       }
  //
  //       extendedLikesInfo.newestLikes.unshift(userLikeInfo)
  //
  //       if (isFirstTime) {
  //         break
  //       }
  //
  //       extendedLikesInfo.dislikesCount -= 1
  //
  //       break
  //     case LIKE_POST_USER_STATUS_ENUM.Dislike:
  //       extendedLikesInfo.dislikesCount += 1
  //
  //       const index = extendedLikesInfo.newestLikes.findIndex(
  //         (info) => info.userId === userLikeInfo.userId,
  //       )
  //
  //       if (index !== -1) {
  //         extendedLikesInfo.newestLikes.splice(index, 1)
  //       }
  //
  //       if (isFirstTime) {
  //         break
  //       }
  //
  //       extendedLikesInfo.likesCount -= 1
  //
  //       break
  //
  //     default:
  //       break
  //   }
  //
  //   post.markModified('extendedLikesInfo')
  //
  //   return await currentPost.save()
  // }
}

export { PostsSqlRepository }
